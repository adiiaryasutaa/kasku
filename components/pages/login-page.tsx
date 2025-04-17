"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import AuthLayout from "@/components/layouts/auth-layout";
import { loginSchema, SignInSchema } from "@/lib/zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authenticate } from "@/actions/login";
import { AuthTokenResponsePassword } from "@supabase/auth-js";

export default function LoginPage() {
	const router = useRouter()
	const { toast } = useToast()
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const form = useForm<SignInSchema>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
			remember: false,
		},
	})

	async function onSubmit(schema: SignInSchema) {
		try {
			setIsLoading(true);
			setErrorMessage(null);

			const response: AuthTokenResponsePassword = await authenticate(schema);

			console.log(response);

			if (response.error) {
				throw new Error(response.error.message);
			}

			toast({
				title: "Login successful",
				description: "Welcome back!",
			})

			router.push("/");
			router.refresh();
		} catch (error) {
			console.error("Login error:", error)
			setErrorMessage("An unexpected error occurred")
			toast({
				title: "Login failed",
				description: "An unexpected error occurred. Please try again.",
				variant: "destructive",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<AuthLayout>
			<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0F0F12] p-4">
				<div className="w-full max-w-md space-y-8">
					<div className="text-center">
						<h1 className="text-3xl font-bold">Welcome back</h1>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
							Sign in to your account to continue
						</p>
					</div>

					<div className="mt-8 bg-white dark:bg-[#1F1F23] p-8 shadow rounded-lg">
						{errorMessage && (
							<div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md">
								{errorMessage}
							</div>
						)}

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<div className="relative">
													<Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
													<Input
														placeholder="you@example.com"
														className="pl-10"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage/>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
													<Input
														type={showPassword ? "text" : "password"}
														placeholder="••••••••"
														className="pl-10"
														{...field}
													/>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
														onClick={() => setShowPassword(!showPassword)}
													>
														{showPassword ? (
															<EyeOff className="h-5 w-5"/>
														) : (
															<Eye className="h-5 w-5"/>
														)}
														<span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
													</Button>
												</div>
											</FormControl>
											<FormMessage/>
										</FormItem>
									)}
								/>

								<div className="flex items-center justify-between">
									<FormField
										control={form.control}
										name="remember"
										render={({ field }) => (
											<div className="flex items-center space-x-2">
												<Checkbox
													id="rememberMe"
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
												<label
													htmlFor="rememberMe"
													className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
												>
													Remember me
												</label>
											</div>
										)}
									/>

									<Link
										href="#"
										className="text-sm font-medium text-primary hover:underline"
									>
										Forgot password?
									</Link>
								</div>

								<Button
									type="submit"
									className="w-full"
									disabled={isLoading}
								>
									{isLoading ? "Signing in..." : "Sign in"}
								</Button>
							</form>
						</Form>

						<div className="mt-6 text-center text-sm">
							<p className="text-gray-600 dark:text-gray-400">
								Don't have an account?{" "}
								<Link
									href="/auth/register"
									className="font-medium text-primary hover:underline"
								>
									Sign up
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</AuthLayout>
	)
}