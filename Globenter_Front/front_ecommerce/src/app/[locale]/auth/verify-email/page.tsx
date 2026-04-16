"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { verifyEmail, resendVerification } from "@/store/slices/authSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { getAuthErrorMessage } from "@/lib/authErrorMessages";

export default function VerifyEmailPage() {
  const t = useTranslations("AuthVerification");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verificationLoading, resendLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const sent = useMemo(() => searchParams.get("sent") === "1", [searchParams]);
  const emailFromQuery = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const pendingIdentifier = useMemo(() => {
    if (typeof window === "undefined") return "";
    return (
      sessionStorage.getItem("pendingSignupEmail") ||
      emailFromQuery ||
      ""
    );
  }, [emailFromQuery]);
  const [status, setStatus] = useState<"idle" | "success" | "expired" | "invalid">(
    "idle"
  );
  const [signupToken, setSignupToken] = useState("");
  const [email, setEmail] = useState("");
  const [didVerify, setDidVerify] = useState(false);
  const [didShowSentToast, setDidShowSentToast] = useState(false);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  useEffect(() => {
    if (!sent || didShowSentToast) return;
    toast.success(t("checkEmail"));
    setDidShowSentToast(true);
  }, [sent, didShowSentToast, t]);

  useEffect(() => {
    if (status !== "success" || !signupToken) return;
    const timeout = window.setTimeout(() => {
      const identifierQuery = pendingIdentifier
        ? `&identifier=${encodeURIComponent(pendingIdentifier)}`
        : "";
      router.replace(
        `/auth/set-password?signup_token=${encodeURIComponent(signupToken)}${identifierQuery}`
      );
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [status, signupToken, pendingIdentifier, router]);

  useEffect(() => {
    if (!token || didVerify) return;
    setDidVerify(true);

    dispatch(verifyEmail({ token }))
      .unwrap()
      .then((payload: any) => {
        const tokenForPassword =
          typeof payload?.signup_token === "string" && payload.signup_token.trim()
            ? payload.signup_token.trim()
            : token;
        setSignupToken(tokenForPassword);
        setStatus("success");
        toast.success(t("verifiedSuccess"));
      })
      .catch((err: any) => {
        if (err?.status === 410 || err?.message === "token_expired") {
          setStatus("expired");
          return;
        }
        const mapped = getAuthErrorMessage({
          err,
          tVerify: t,
          fallback: t("invalidToken"),
        });
        if (mapped === t("expiredToken")) {
          setStatus("expired");
          return;
        }
        setStatus("invalid");
      });
  }, [token, didVerify, dispatch, t]);

  const handleGoSetPassword = () => {
    if (!signupToken) return;
    const identifierQuery = pendingIdentifier
      ? `&identifier=${encodeURIComponent(pendingIdentifier)}`
      : "";
    router.push(
      `/auth/set-password?signup_token=${encodeURIComponent(signupToken)}${identifierQuery}`
    );
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error(t("enterEmail"));
      return;
    }
    try {
      const result = await dispatch(
        resendVerification({ email: email.trim() })
      ).unwrap();
      if (result?.message === "already_verified") {
        toast.success(t("emailAlreadyVerified"));
        return;
      }
      toast.success(t("verificationSent"));
    } catch (err: any) {
      toast.error(
        getAuthErrorMessage({
          err,
          tVerify: t,
          fallback: t("resendFailed"),
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-xl dark:shadow-black/40 p-6 md:p-8 border border-transparent dark:border-gray-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("verifyTitle")}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t("verifySubtitle")}
        </p>

        {verificationLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("verifying")}</p>
        )}

        {!verificationLoading && status === "success" && (
          <div className="rounded-lg border border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-950/30 p-4">
            <p className="text-green-800 dark:text-green-200 text-sm">
              {t("verifiedSuccess")}
            </p>
            <button
              type="button"
              onClick={handleGoSetPassword}
              className="mt-3 inline-flex items-center rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
            >
              {t("setPasswordNow")}
            </button>
          </div>
        )}

        {!verificationLoading && (status === "expired" || status === "invalid" || !token) && (
          <div className="rounded-lg border border-orange-200 dark:border-orange-900/60 bg-orange-50 dark:bg-orange-950/30 p-4 space-y-3">
            <p className="text-sm text-orange-900 dark:text-orange-200">
              {!token
                ? t("checkEmail")
                : status === "expired"
                  ? t("expiredToken")
                  : t("invalidToken")}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full sm:flex-1 p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg border border-orange-200 dark:border-orange-900/60 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="px-4 py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {resendLoading ? t("sending") : t("resendButton")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
