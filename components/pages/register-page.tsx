"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { register } from "@/actions/register"
import AuthLayout from "@/components/layouts/auth-layout";
import { registerSchema, RegisterSchema } from "@/lib/zod";

export default function RegisterPage() {
	const router = useRouter()
	const { toast } = useToast()
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const form = useForm<RegisterSchema>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	})

	async function onSubmit(schema: RegisterSchema) {
		try {
			setIsLoading(true);
			setErrorMessage(null);

			const result = await register(schema);

			if (result.success) {
				toast({
					title: "Registration successful",
					description: "Your account has been created. You can now log in.",
				})

				// Redirect to login page after successful registration
				router.push("/auth/login")
			} else {
				setErrorMessage(result.message || "Registration failed")
				toast({
					title: "Registration failed",
					description: result.message || "There was a problem creating your account.",
					variant: "destructive",
				})
			}
		} catch (error) {
			console.error("Registration error:", error)
			setErrorMessage("An unexpected error occurred")
			toast({
				title: "Registration failed",
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
						<h1 className="text-3xl font-bold">Create an account</h1>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
							Sign up to get started with our platform
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
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Full Name</FormLabel>
											<FormControl>
												<div className="relative">
													<User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
													<Input
														placeholder="John Doe"
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

								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirm Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
													<Input
														type={showConfirmPassword ? "text" : "password"}
														placeholder="••••••••"
														className="pl-10"
														{...field}
													/>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
														onClick={() => setShowConfirmPassword(!showConfirmPassword)}
													>
														{showConfirmPassword ? (
															<EyeOff className="h-5 w-5"/>
														) : (
															<Eye className="h-5 w-5"/>
														)}
														<span className="sr-only">
                            {showConfirmPassword ? "Hide password" : "Show password"}
                          </span>
													</Button>
												</div>
											</FormControl>
											<FormMessage/>
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									className="w-full"
									disabled={isLoading}
								>
									{isLoading ? "Creating account..." : "Create account"}
								</Button>
							</form>
						</Form>

						<div className="mt-6 text-center text-sm">
							<p className="text-gray-600 dark:text-gray-400">
								Already have an account?{" "}
								<Link
									href="/auth/login"
									className="font-medium text-primary hover:underline"
								>
									Sign in
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</AuthLayout>
	)
}