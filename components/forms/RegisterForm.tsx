"use client";

import Image from "next/image";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl } from "@/components/ui/form";
import { useState } from "react";
import { PatientFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { registerPatient } from "@/lib/actions/patient.actions";
import { FormFieldType } from "./PatientForm";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
	Doctors,
	GenderOptions,
	IdentificationTypes,
	PatientFormDefaultValues,
} from "@/constants";
import { Label } from "../ui/label";
import { SelectItem } from "../ui/select";
import FileUploader from "../FileUploader";

const RegisterForm = ({ user }: { user: User }) => {
	const [isLoading, setIsLoading] = useState(false); // State to manage loading status
	const router = useRouter(); // Hook to navigate between routes

	const form = useForm<z.infer<typeof PatientFormValidation>>({
		resolver: zodResolver(PatientFormValidation), // Validation resolver for form data
		defaultValues: {
			...PatientFormDefaultValues, // Spread operator for default values
			name: "",
			email: "",
			phone: "",
		},
	});

	async function onSubmit(values: z.infer<typeof PatientFormValidation>) {
		setIsLoading(true); // Set loading state to true on form submission

		let formData;

		if (
			values.identificationDocument &&
			values.identificationDocument.length > 0
		) {
			// Check if identification document exists and has length
			const blobFile = new Blob([values.identificationDocument[0]], {
				type: values.identificationDocument[0].type, // Create a Blob object from identification document
			});

			formData = new FormData(); // Initialize FormData object

			formData.append("blobFile", blobFile); // Append Blob file to FormData
			formData.append("fileName", values.identificationDocument[0].name); // Append file name to FormData
		}

		try {
			const patientData = {
				...values, // Spread operator for form values
				userId: user.$id, // Add user ID to patient data
				birthDate: new Date(values.birthDate), // Convert birth date to Date object
				identificationDocument: formData, // Add FormData with identification document
			};

			// @ts-ignore
			const patient = await registerPatient(patientData); // Call API to register patient

			if (patient) router.push(`/patients/${user.$id}/new-appointment`); // Navigate to new appointment page if registration is successful
		} catch (error) {
			console.log(error); // Log error if registration fails
		} finally {
			setIsLoading(false); // Set loading state to false after process completion
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-12 flex-1"
			>
				<section className="space-y-4">
					<h1 className="header">Welcome 👋</h1>
					<p className="text-dark-700">Let us know more about yourself</p>
				</section>

				<section className="space-y-6">
					<div className="mb-9 space-y-1">
						<h2 className="sub-header"> Personal information</h2>
					</div>
				</section>

				{/* Full name */}
				<CustomFormField
					fieldType={FormFieldType.INPUT}
					control={form.control}
					name="name"
					label="Full name"
					placeholder="Yash Bhavsar"
					iconSrc="/assets/icons/user.svg"
					iconAlt="user"
				/>

				{/* Email and phone number */}
				<div className="flex flex-col gap-6 xl:flex-row">
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
						placeholder="+9192223-23232"
					/>
				</div>

				{/* birthDate and gender */}
				<div className="flex flex-col gap-6 xl:flex-row">
					<CustomFormField
						fieldType={FormFieldType.DATE_PICKER}
						control={form.control}
						name="birthDate"
						label="Date of birth"
					/>

					<CustomFormField
						fieldType={FormFieldType.SKELETON}
						control={form.control}
						name="gender"
						label="Gender"
						renderSkeleton={(field) => (
							<FormControl>
								<RadioGroup
									className="flex h-11 gap-6 xl:justify-between"
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									{GenderOptions.map((option) => (
										<div key={option} className="radio-group">
											<RadioGroupItem value={option} id={option} />
											<Label htmlFor={option} className="cursor-pointer">
												{option}
											</Label>
										</div>
									))}
								</RadioGroup>
							</FormControl>
						)}
					/>
				</div>

				{/* Address and occupation */}
				<div className="flex flex-col gap-6 xl:flex-row">
					<CustomFormField
						fieldType={FormFieldType.INPUT}
						control={form.control}
						name="address"
						label="Address"
						placeholder="katraj, Pune 46"
					/>

					<CustomFormField
						fieldType={FormFieldType.INPUT}
						control={form.control}
						name="occupation"
						label="Occupation"
						placeholder="Software Engineer"
					/>
				</div>

				{/*  Emergency contact name and number */}
				<div className="flex flex-col gap-6 xl:flex-row">
					<CustomFormField
						fieldType={FormFieldType.INPUT}
						control={form.control}
						name="emergencyContactName"
						label="Emergency contact name"
						placeholder="Guardian's name"
					/>
					<CustomFormField
						fieldType={FormFieldType.PHONE_INPUT}
						control={form.control}
						name="emergencyContactNumber"
						label="Emergency contact number"
						placeholder="+9192223-23232"
					/>
				</div>

				<section className="space-y-6">
					<div className="mb-9 space-y-1">
						<h2 className="sub-header"> Medical Information</h2>
					</div>
				</section>

				<CustomFormField
					fieldType={FormFieldType.SELECT}
					control={form.control}
					name="primaryPhysician"
					label="Primary Physician"
					placeholder="Select a physician"
				>
					{Doctors.map((doctor) => (
						<SelectItem key={doctor.name} value={doctor.name}>
							<div className="flex cursor-pointer items-center gap-2">
								<Image
									src={doctor.image}
									width={32}
									height={32}
									alt={doctor.name}
									className="rounded-full border border-dark-500"
								/>
								<p>{doctor.name}</p>
							</div>
						</SelectItem>
					))}
				</CustomFormField>

				{/* Insurance Provider and policy number  */}
				<div className="flex flex-col gap-6 xl:flex-row">
					<CustomFormField
						fieldType={FormFieldType.INPUT}
						control={form.control}
						name="insuranceProvider"
						label="Insurance Provider"
						placeholder="ICICI"
					/>

					<CustomFormField
						fieldType={FormFieldType.INPUT}
						control={form.control}
						name="insurancePolicyNumber"
						label="Insurance policy number"
						placeholder="184339djwjd"
					/>
				</div>

				{/* Allergies  */}
				<div className="flex flex-col gap-6 xl:flex-row">
					<CustomFormField
						fieldType={FormFieldType.TEXTAREA}
						control={form.control}
						name="allergies"
						label="Allergies (If any)"
						placeholder="Peanuts etc"
					/>

					<CustomFormField
						fieldType={FormFieldType.TEXTAREA}
						control={form.control}
						name="currentMedication"
						label="Current Medication"
						placeholder="Ibuprofan 200mg, Paracetamol 500mg"
					/>
				</div>

				{/* Family medication and family history  */}
				<div className="flex flex-col gap-6 xl:flex-row">
					<CustomFormField
						fieldType={FormFieldType.TEXTAREA}
						control={form.control}
						name="familyMedicalHistory"
						label="Family Medical History"
						placeholder="Mother had cancer and father had heart disease"
					/>

					<CustomFormField
						fieldType={FormFieldType.TEXTAREA}
						control={form.control}
						name="pastMedicalHistory"
						label="Past Medical History"
						placeholder="Appendectomy, Toncillectomy"
					/>
				</div>

				{/* Identification type and number */}
				<section className="space-y-6">
					<div className="mb-9 space-y-1">
						<h2 className="sub-header"> Identification and verification</h2>
					</div>
				</section>

				<CustomFormField
					fieldType={FormFieldType.SELECT}
					control={form.control}
					name="identificationType"
					label="Identification Type"
					placeholder="Select Identification Document (Ex:- Driver's license)"
				>
					{IdentificationTypes.map((type) => (
						<SelectItem key={type} value={type}>
							{type}
						</SelectItem>
					))}
				</CustomFormField>

				<CustomFormField
					fieldType={FormFieldType.INPUT}
					control={form.control}
					name="identificationNumber"
					label="Identification Number"
					placeholder="1234567890"
				/>

				{/* Identification document */}
				<CustomFormField
					fieldType={FormFieldType.SKELETON}
					control={form.control}
					name="identificationDocument"
					label="Scanned copy of identification document"
					renderSkeleton={(field) => (
						<FormControl>
							<FileUploader files={field.value} onChange={field.onChange} />
						</FormControl>
					)}
				/>

				<section className="space-y-6">
					<div className="mb-9 space-y-1">
						<h2 className="sub-header"> Consent and Privacy</h2>
					</div>
				</section>

				<CustomFormField
					fieldType={FormFieldType.CHECKBOX}
					control={form.control}
					name="treatmentConsent"
					label="I consent to treatment"
				/>

				<CustomFormField
					fieldType={FormFieldType.CHECKBOX}
					control={form.control}
					name="disclosureConsent"
					label="I consent to disclosure of information"
				/>

				<CustomFormField
					fieldType={FormFieldType.CHECKBOX}
					control={form.control}
					name="privacyConsent"
					label="I consent to privacy policy"
				/>

				<SubmitButton isLoading={isLoading}> Get Started </SubmitButton>
			</form>
		</Form>
	);
};

export default RegisterForm;
