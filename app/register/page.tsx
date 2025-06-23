import RegisterForm from "@/components/auth/register-form";

export default function RegisterPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-extrabold text-blue-800">
						Create an Account
					</h1>
					<p className="mt-2 text-sm text-gray-800">Join our community today</p>
				</div>
				<RegisterForm />
				<div className="text-center mt-4">
					<p className="text-sm text-gray-800">
						Already have an account?{" "}
						<a
							href="/login"
							className="font-medium text-blue-700 hover:text-blue-900"
						>
							Sign in here
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
