"use client";

import { FC } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { socialLogin } from "@/store/slices/authSlice";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface GoogleButtonProps {}

const GoogleLoginButton: FC<GoogleButtonProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const login = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      const access_token = (tokenResponse as any).access_token;

      if (!access_token) {
        toast.error("Google did not return a valid token.");
        return;
      }

      try {
        // Dispatch social login thunk
        const result = await dispatch(
          socialLogin({ provider: "google", access_token })
        ).unwrap();

        // Show welcome message
        toast.success(`Welcome, ${result.user.username || "user"}!`);

        // ✅ Redirect based on newUser flag
        if (result.newUser) {
          toast("Please complete your registration.", { duration: 3000 });
          router.push("/auth/register");
        } else {
          router.push("/");
        }
      } catch (err: any) {
        if (err?.non_field_errors?.length) {
          err.non_field_errors.forEach((msg: string) => toast.error(msg));
        } else if (err?.detail) {
          toast.error(err.detail);
        } else {
          toast.error("Google login failed.");
        }
      }
    },
    onError: () => toast.error("Google login failed."),
  });

  return (
    <button
      onClick={() => login()}
      className="flex-1 border border-gray-300 p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-all duration-150"
    >
      <FcGoogle className="text-2xl" />
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;
