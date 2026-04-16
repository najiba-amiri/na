"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store/store";
import { preRegister } from "@/store/slices/authSlice";
import Lang from "@/components/Lang";
import { useTranslations } from "next-intl";
import GoogleLoginButton from "@/components/ui/GoogleLoginButton";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { getAuthErrorMessage } from "@/lib/authErrorMessages";

interface RegisterFormInputs {
  fullName: string;
  email: string;
}

const Page = () => {
  const t = useTranslations("Register");
  const tv = useTranslations("AuthVerification");
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({});

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      await dispatch(preRegister({
        full_name: data.fullName.trim(),
        email: data.email.trim(),
      })).unwrap();
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pendingSignupFullName", data.fullName.trim());
        sessionStorage.setItem("pendingSignupEmail", data.email.trim());
      }
      toast.success(tv("checkEmail"), {
        position: "top-center",
      });
      router.push(`/auth/verify-email?sent=1&email=${encodeURIComponent(data.email.trim())}`);
    } catch (err: any) {
      const mapped = getAuthErrorMessage({
        err,
        tVerify: tv,
        fallback: t("registerFailed"),
      });
      toast.error(mapped, { position: "top-center" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors">
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
            <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">Golbe Enter</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("createAccount")}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t("fillDetails")}</p>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <input
              {...register("fullName", { required: t("fullNameRequired") })}
              type="text"
              placeholder={t("fullNamePlaceholder")}
              className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg border border-transparent dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}

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
              className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg"
            >
              {loading ? t("signingUp") : t("continue")}
            </button>
          </form>

          {googleClientId && (
            <>
              {/* OR Divider */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500 dark:text-gray-400 text-sm">{t("orSignUpWith")}</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Social Buttons */}
              <GoogleOAuthProvider clientId={googleClientId}>
                <div className="flex gap-4">
                  <GoogleLoginButton />
                </div>
              </GoogleOAuthProvider>
            </>
          )}

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/auth/login" className="text-orange-500 cursor-pointer">
              {t("login")}
            </Link>
          </p>
        </div>

        {/* Left Column (Image) */}
        <div className="flex items-center justify-center order-2 md:order-1 mt-8 md:mt-0">
          <div className="rounded-2xl relative bg-center text-white px-10 py-10 md:py-20 flex flex-col justify-evenly">
            <Image
              src="/assets/images/register.svg"
              alt="Register Illustration"
              width={400}
              height={400}
              style={{ width: "auto", height: "auto" }}
              className="hidden md:block object-contain"
              priority
            />
            <Image
              src="/assets/images/register.svg"
              alt="Register Illustration"
              width={250}
              height={250}
              style={{ width: "auto", height: "auto" }}
              className="block md:hidden object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
