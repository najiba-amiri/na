"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/store/slices/authSlice";
import { AppDispatch, RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import Lang from "@/components/Lang";
import GoogleLoginButton from "@/components/ui/GoogleLoginButton";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { getAuthErrorMessage } from "@/lib/authErrorMessages";
import { clearProfile } from "@/store/slices/profileSlice";

interface LoginFormInputs {
  email: string;
  password: string;
}

const Page = () => {
  const t = useTranslations("login");
  const tv = useTranslations("AuthVerification");
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    toast.dismiss();
    dispatch(clearProfile());

    try {
      await dispatch(login(data)).unwrap();
      toast.success(t("loggedInSuccess"), { duration: 2000 });
      router.push("/");
    } catch (err: any) {
      toast.dismiss();
      if (err?.code === "email_not_verified") {
        const encodedEmail = data.email ? `?email=${encodeURIComponent(data.email)}` : "";
        toast.error(err?.message || tv("emailRequiredBeforeLogin"), { duration: 3500 });
        router.push(`/auth/verify-email${encodedEmail}`);
        return;
      }

      if (err) {
        if (typeof err === "object") {
          const mapped = getAuthErrorMessage({
            err,
            tVerify: tv,
            fallback: t("loginFailed"),
          });
          if (mapped) {
            toast.error(mapped, { duration: 3000 });
            return;
          }
          Object.keys(err).forEach((key) => {
            if (key === "status" || key === "code") return;
            if (Array.isArray(err[key])) {
              err[key].forEach((msg: string) =>
                toast.error(msg, { duration: 3000 })
              );
            } else {
              toast.error(err[key], { duration: 3000 });
            }
          });
        } else {
          toast.error(err?.detail || t("loginFailed"), {
            duration: 3000,
          });
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 relative transition-colors">
      {/* Language Selector */}
      <div className="absolute top-6 left-6 z-50 bg-gradient-to-r from-[#b16926] to-[#f1a013] rounded-xl shadow-lg">
        <Lang />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl dark:shadow-gray-950/60 border border-transparent dark:border-gray-800 overflow-hidden max-w-6xl w-full p-5 transition-colors">
        {/* Right Column (Form) */}
        <div className="flex flex-col justify-center p-10 order-1 md:order-2">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-orange-500 w-10 h-10 flex items-center justify-center rounded-full">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">{t("brandName")}</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("welcomeBack")}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t("loginSubtitle")}</p>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <input
              type="email"
              placeholder={t("emailPlaceholder")}
              className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              {...register("email", { required: t("emailRequired") })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}

            <input
              type="password"
              placeholder={t("passwordPlaceholder")}
              className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              {...register("password", { required: t("passwordRequired") })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}

            <div className="flex justify-between items-center text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-orange-500 cursor-pointer"
              >
                {t("forgotPassword")}
              </Link>
              <label className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-orange-500"
                />
                {t("rememberMe")}
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition-all duration-200"
              disabled={loading}
            >
              {loading ? t("loggingIn") : t("loginButton")}
            </button>
          </form>

          {googleClientId && (
            <>
              {/* OR Divider */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500 dark:text-gray-400 text-sm">
                  {t("orLoginWith")}
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Social Login Buttons */}
              <GoogleOAuthProvider clientId={googleClientId}>
                <div className="flex gap-4">
                  <GoogleLoginButton {...({ onSuccessRedirect: () => router.push("/") } as any)} />
                </div>
              </GoogleOAuthProvider>
            </>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {t("noAccountPrompt")}{" "}
            <Link
              href="/auth/register"
              className="text-orange-500 cursor-pointer font-medium"
            >
              {t("signUp")}
            </Link>
          </p>
        </div>

        {/* Left Column (Image) */}
        <div className="flex items-center justify-center order-2 md:order-1 mt-8 md:mt-0 relative">
          <div className="rounded-2xl relative bg-center text-white px-10 py-10 md:py-20 flex flex-col justify-evenly">
            <div className="flex justify-center">
              <Image
                src="/assets/images/login.svg"
                alt="Login Illustration"
                width={400}
                height={400}
                className="hidden md:block object-contain"
                priority
              />
              <Image
                src="/assets/images/login.svg"
                alt="Login Illustration"
                width={250}
                height={250}
                className="block md:hidden object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
