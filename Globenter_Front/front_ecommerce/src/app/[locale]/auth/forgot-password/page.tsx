"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppDispatch, RootState } from "@/store/store";
import { forgotPassword } from "@/store/slices/authSlice";
import { getAuthErrorMessage } from "@/lib/authErrorMessages";

interface ForgotPasswordFormInputs {
  email: string;
}

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const tv = useTranslations("AuthVerification");
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>();

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (data) => {
    try {
      await dispatch(forgotPassword({ email: data.email.trim() })).unwrap();
      toast.success(t("emailSent"));
    } catch (err: any) {
      toast.error(
        getAuthErrorMessage({
          err,
          tVerify: tv,
          fallback: t("requestFailed"),
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl dark:shadow-black/40 p-6 md:p-8 border border-transparent dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{t("subtitle")}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("email", { required: t("emailRequired") })}
            type="email"
            placeholder={t("emailPlaceholder")}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg disabled:opacity-70"
          >
            {loading ? t("sending") : t("sendButton")}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-600 dark:text-gray-300">
          <Link href="/auth/login" className="text-orange-500 hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
