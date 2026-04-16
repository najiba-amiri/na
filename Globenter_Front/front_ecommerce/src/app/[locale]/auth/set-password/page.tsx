"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import { AppDispatch, RootState } from "@/store/store";
import { login, setPassword } from "@/store/slices/authSlice";
import { clearProfile, fetchProfile } from "@/store/slices/profileSlice";
import { getAuthErrorMessage } from "@/lib/authErrorMessages";
import { useRouter } from "@/i18n/navigation";

interface SetPasswordFormInputs {
  password1: string;
  password2: string;
}

export default function SetPasswordPage() {
  const t = useTranslations("AuthVerification");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading } = useSelector((state: RootState) => state.auth);

  const signupToken = useMemo(
    () => searchParams.get("signup_token") || "",
    [searchParams]
  );
  const identifier = useMemo(() => {
    const fromQuery = searchParams.get("identifier");
    if (fromQuery) return fromQuery;
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("pendingSignupEmail") || "";
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormInputs>();

  const onSubmit: SubmitHandler<SetPasswordFormInputs> = async (data) => {
    if (!signupToken) {
      toast.error(t("tokenMissing"));
      return;
    }
    if (data.password1 !== data.password2) {
      toast.error(t("passwordMismatch"));
      return;
    }

    try {
      const setPasswordResult = await dispatch(
        setPassword({
          signup_token: signupToken,
          password1: data.password1,
          password2: data.password2,
        })
      ).unwrap();
      if (!setPasswordResult?.access && identifier) {
        await dispatch(
          login({
            email: identifier,
            password: data.password1,
          })
        ).unwrap();
      }
      dispatch(clearProfile());
      await dispatch(fetchProfile(true));
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pendingSignupFullName");
        sessionStorage.removeItem("pendingSignupEmail");
      }
      toast.success(t("passwordSetSuccess"));
      router.push("/");
    } catch (err: any) {
      toast.error(
        getAuthErrorMessage({
          err,
          tVerify: t,
          fallback: t("passwordSetFailed"),
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-black/40 p-8">
        <h1 className="text-3xl font-extrabold text-orange-500 dark:text-orange-400 text-center mb-2">
          {t("setPasswordTitle")}
        </h1>
        <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-6">
          {t("setPasswordSubtitle")}
        </p>

        {!signupToken ? (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
            {t("tokenMissing")}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...register("password1", { required: t("passwordRequired") })}
              type="password"
              placeholder={t("passwordPlaceholder")}
              className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.password1 && (
              <p className="text-red-500 text-sm">{errors.password1.message}</p>
            )}

            <input
              {...register("password2", { required: t("confirmPasswordRequired") })}
              type="password"
              placeholder={t("confirmPasswordPlaceholder")}
              className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.password2 && (
              <p className="text-red-500 text-sm">{errors.password2.message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg disabled:opacity-70"
            >
              {loading ? t("settingPassword") : t("setPasswordButton")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
