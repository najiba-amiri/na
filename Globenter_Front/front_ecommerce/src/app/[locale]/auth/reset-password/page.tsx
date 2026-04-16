"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import type { AppDispatch, RootState } from "@/store/store";
import { resetPassword } from "@/store/slices/authSlice";
import { getAuthErrorMessage } from "@/lib/authErrorMessages";

interface ResetPasswordFormInputs {
  password1: string;
  password2: string;
}

export default function ResetPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const tv = useTranslations("AuthVerification");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading } = useSelector((state: RootState) => state.auth);

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const uid = useMemo(() => searchParams.get("uid") || "", [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>();

  const onSubmit: SubmitHandler<ResetPasswordFormInputs> = async (data) => {
    if (!token || !uid) {
      toast.error(t("tokenMissing"));
      return;
    }
    if (data.password1 !== data.password2) {
      toast.error(t("passwordMismatch"));
      return;
    }

    try {
      await dispatch(
        resetPassword({
          uid,
          token,
          password1: data.password1,
          password2: data.password2,
        })
      ).unwrap();
      toast.success(t("resetSuccess"));
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(
        getAuthErrorMessage({
          err,
          tVerify: tv,
          fallback: t("resetFailed"),
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl dark:shadow-black/40 p-6 md:p-8 border border-transparent dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t("resetTitle")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{t("resetSubtitle")}</p>

        {!token || !uid ? (
          <div className="rounded-lg border border-orange-200 dark:border-orange-900/60 bg-orange-50 dark:bg-orange-950/30 p-4 text-sm text-orange-900 dark:text-orange-200">
            {t("tokenMissing")}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...register("password1", { required: t("passwordRequired") })}
              type="password"
              placeholder={t("newPasswordPlaceholder")}
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
              {loading ? t("resetting") : t("resetButton")}
            </button>
          </form>
        )}

        <p className="text-center mt-5 text-sm text-gray-600 dark:text-gray-300">
          <Link href="/auth/login" className="text-orange-500 hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
