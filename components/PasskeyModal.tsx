"use client";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { decryptKey, encryptKey } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PasskeyModal = () => {
	const router = useRouter();

	// Hook to get current pathname
	const path = usePathname();

	// State to manage the modal open/close status
	const [open, setOpen] = useState(false);

	// State to manage the input passkey
	const [passkey, setPasskey] = useState("");

	// State to manage error messages
	const [error, setError] = useState("");

	// Retrieve the encrypted access key from local storage if available
	const encryptedKey =
		typeof window !== "undefined"
			? window.localStorage.getItem("accessKey")
			: null;

	// useEffect to handle access key validation on component mount
	useEffect(() => {
		const accesskey = encryptedKey && decryptKey(encryptedKey);
			if (path) {
				console.log(path);
				if (accesskey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
					// Redirect to admin page if access key is valid
					router.push("/admin");
				} else {
					// Open the modal if access key is invalid
					setOpen(true);
				}
			}
	}, [encryptedKey, path, router]);

	// Function to validate the input passkey
	const validatePasskey = (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		e.preventDefault();

		// Check if the input passkey matches the environment passkey
		if (passkey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
			const encryptedKey = encryptKey(passkey);
			localStorage.setItem("accessKey", encryptedKey);
			setOpen(false);
			router.push("/admin");
		} else {
			// Set error message if passkey is invalid
			setError("Invalid passkey. Please try again");
		}
	};

	// Function to handle modal close and redirect to home page
	const closeModal = () => {
		setOpen(false);
		router.push("/");
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent className="shad-alert-dialog">
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-start justify-between">
						Admin Access Verification
						<Image
							src="/assets/icons/close.svg"
							alt="close"
							width={20}
							height={20}
							onClick={() => closeModal()}
							className="cursor-pointer"
						/>
					</AlertDialogTitle>
					<AlertDialogDescription>
						To access the admin page, please enter the passkey.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div>
					<InputOTP
						maxLength={6}
						value={passkey}
						onChange={(value) => setPasskey(value)}
					>
						<InputOTPGroup className="shad-otp">
							<InputOTPSlot className="shad-otp-slot" index={0} />
							<InputOTPSlot className="shad-otp-slot" index={1} />
							<InputOTPSlot className="shad-otp-slot" index={2} />
							<InputOTPSlot className="shad-otp-slot" index={3} />
							<InputOTPSlot className="shad-otp-slot" index={4} />
							<InputOTPSlot className="shad-otp-slot" index={5} />
						</InputOTPGroup>
					</InputOTP>

					{error && (
						<p className="shad-error text-14-regular mt-4 flex justify-center">
							{error}
						</p>
					)}
				</div>
				<AlertDialogFooter>
					<AlertDialogAction
						onClick={(e) => validatePasskey(e)}
						className="shad-primary-btn w-full"
					>
						Enter Admin Passkey
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default PasskeyModal;
