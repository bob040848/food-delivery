//client/src/app/auth/reset-password/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  Lock,
  Star,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const cloudinaryBaseUrl = "https://res.cloudinary.com/ddrmhu7ak/image/upload";
  const imagePublicId = "sign-up-food-delivery-pic_bnxl0o";

  const heroImageUrl = `${cloudinaryBaseUrl}/f_auto,q_auto,w_1200,h_800,c_fill/${imagePublicId}.png`;

  useEffect(() => {
    if (errorParam) {
      switch (errorParam) {
        case "invalid-token":
          setError("The password reset link is invalid.");
          break;
        case "expired-token":
          setError(
            "This password reset link has expired. Please request a new one."
          );
          break;
        case "user-not-found":
          setError(
            "The user associated with this reset link could not be found."
          );
          break;
        default:
          setError("An error occurred with your password reset link.");
      }
    }
  }, [errorParam]);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Something went wrong");
        }

        setSuccess(
          "✅ Your password has been reset successfully! Redirecting to sign in..."
        );
        formik.resetForm();

        setTimeout(() => {
          router.push("/auth/sign-in?message=password-reset-success");
        }, 3000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  if ((!token && !errorParam) || (errorParam && error)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="flex min-h-screen">
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
            <div className="absolute inset-0">
              {!imageError ? (
                <Image
                  src={heroImageUrl}
                  alt="Delicious food delivery"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={85}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgMAAAAAAAAAAAAAAAAAAAECEgMR/9oADAMBAAIRAxEAPwCdABmZOxpNnaMg4HjMP/9k="
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-500 to-pink-600"></div>
              )}
            </div>

            <div className="absolute inset-0 bg-black/40"></div>

            <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
              <div className="max-w-md">
                <h1 className="text-4xl font-bold mb-6 leading-tight">
                  Reset Link
                  <br />
                  <span className="text-orange-300">Issue</span>
                </h1>

                <p className="text-xl mb-8 text-gray-200 leading-relaxed">
                  Don&apos;t worry! We&apos;ll help you get a new reset link and get back
                  to enjoying delicious food.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <Truck className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg">Fast 30-minute delivery</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg">Fresh & quality guaranteed</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg">Top-rated restaurants</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg">24/7 customer support</span>
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-300">
                      50K+
                    </div>
                    <div className="text-sm text-gray-300">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-300">
                      200+
                    </div>
                    <div className="text-sm text-gray-300">
                      Partner Restaurants
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
            <div className="w-full max-w-md">
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm lg:bg-white">
                <CardHeader className="space-y-2 text-center pb-8">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                    Reset Link Error
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    There was an issue with your password reset link
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-50"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-red-800">Error</AlertTitle>
                    <AlertDescription className="text-red-700">
                      {error ||
                        "This password reset link is invalid or has expired."}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                      onClick={() => router.push("/auth/forgot-password")}
                    >
                      Request New Reset Link
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-12 border-2 border-gray-200 hover:border-orange-300 font-semibold rounded-xl transition-all duration-200"
                      onClick={() => router.push("/auth/sign-in")}
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (<Suspense>
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0">
            {!imageError ? (
              <Image
                src={heroImageUrl}
                alt="Delicious food delivery"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgMAAAAAAAAAAAAAAAAAAAECEgMR/9oADAMBAAIRAxEAPwCdABmZOxpNnaMg4HjMP/9k="
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-500 to-pink-600"></div>
            )}
          </div>

          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold mb-6 leading-tight">
                Create New
                <br />
                <span className="text-orange-300">Password</span>
              </h1>

              <p className="text-xl mb-8 text-gray-200 leading-relaxed">
                Almost there! Create a strong password and get back to enjoying
                delicious food delivered to your door.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Fast 30-minute delivery</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Fresh & quality guaranteed</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">Top-rated restaurants</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg">24/7 customer support</span>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-300">50K+</div>
                  <div className="text-sm text-gray-300">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-300">200+</div>
                  <div className="text-sm text-gray-300">
                    Partner Restaurants
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm lg:bg-white">
              <CardHeader className="space-y-2 text-center pb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Reset Password
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Create a new strong password for your account
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-50"
                  >
                    <AlertTitle className="text-red-800">Error</AlertTitle>
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertTitle className="text-green-800">Success!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={formik.handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-gray-700"
                    >
                      New Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...formik.getFieldProps("password")}
                      className={`border-2 transition-all duration-200 focus:border-orange-400 h-12 ${
                        formik.touched.password && formik.errors.password
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 focus:bg-white"
                      }`}
                    />
                    {formik.touched.password && formik.errors.password && (
                      <p className="text-xs text-red-500 mt-1">
                        {formik.errors.password}
                      </p>
                    )}
                    <div className="text-xs text-gray-500">
                      Password must be at least 8 characters with uppercase,
                      lowercase, and numbers
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Confirm New Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...formik.getFieldProps("confirmPassword")}
                      className={`border-2 transition-all duration-200 focus:border-orange-400 h-12 ${
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 focus:bg-white"
                      }`}
                    />
                    {formik.touched.confirmPassword &&
                      formik.errors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          {formik.errors.confirmPassword}
                        </p>
                      )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] mt-8"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="pt-6 pb-8">
                <div className="w-full text-center">
                  <p className="text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link
                      href="/auth/sign-in"
                      className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </Suspense>)
};

 export const ResetPassword = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
};

