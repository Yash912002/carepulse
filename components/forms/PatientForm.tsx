"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import { UserFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/actions/patient.actions";

// Define an enum for different form field types.
export enum FormFieldType {
	INPUT = "input",
	TEXTAREA = "textarea",
	CHECKBOX = "checkbox",
	PHONE_INPUT = "phoneInput",
	DATE_PICKER = "datePicker",
	SELECT = "select",
	SKELETON = "skeleton",
}

const PatientForm = () => {
	// Initialize a state variable to track the loading state of the form submission.
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	// Define the form with validation using zodResolver and default values for the fields.
	const form = useForm<z.infer<typeof UserFormValidation>>({
		resolver: zodResolver(UserFormValidation),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
		},
	});

	// Define a submit handler to create a new user and redirect to the registration page on success.

	async function onSubmit({
		name,
		email,
		phone,
	}: z.infer<typeof UserFormValidation>) {
		console.log("Patient ", name, email, phone);
		setIsLoading(true);

		try {
			// Create a new user with the submitted data.
			const userData = { name, email, phone };
			const user = await createUser(userData);

			// Redirect to the registration page if the user is created successfully.
			if (user) {
				router.push(`/patients/${user.$id}/register`);
			}
		} catch (error) {
			console.log(error);
		}
		setIsLoading(false);
	}

	// Render the form with custom form fields and a submit button
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
				<section className="mb-12 space-y-4">
					<h1 className="header">Hi there 👋</h1>
					<p className="text-dark-700">Get started with appointments.</p>
				</section>

				<CustomFormField
					fieldType={FormFieldType.INPUT}
					control={form.control}
					name="name"
					label="Full name"
					placeholder="Yash Bhavsar"
					iconSrc="/assets/icons/user.svg"
					iconAlt="user"
				/>

				<CustomFormField
					fieldType={FormFieldType.INPUT}
					control={form.control}
					name="email"
					label="Email"
					placeholder="user@gmail.com"
					iconSrc="/assets/icons/email.svg"
					iconAlt="email"
				/>

				<CustomFormField
					fieldType={FormFieldType.PHONE_INPUT}
					control={form.control}
					name="phone"
					label="Phone Number"
					placeholder="+9192223 23232"
				/>

				<SubmitButton isLoading={isLoading}> Get Started </SubmitButton>
			</form>
		</Form>
	);
};

export default PatientForm;
