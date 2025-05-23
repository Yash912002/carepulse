"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import { getAppointmentSchema } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/actions/patient.actions";
import { FormFieldType } from "./PatientForm";
import { SelectItem } from "../ui/select";
import Image from "next/image";
import { Doctors } from "@/constants";
import {
	createAppointment,
	updateAppointment,
} from "@/lib/actions/appointment.actions";
import { Appointment } from "@/types/appwrite.types";

const AppointmentForm = ({
	type,
	userId,
	patientId,
	appointment,
	setOpen,
}: {
	userId: string;
	type: "create" | "cancel" | "schedule";
	patientId: string;
	appointment?: Appointment;
	setOpen?: (open: boolean) => void;
}) => {
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();

	// Get appointment validation schema based on the type
	const AppointmentFormValidation = getAppointmentSchema(type);

	// Initialize form with validation schema and default values
	const form = useForm<z.infer<typeof AppointmentFormValidation>>({
		resolver: zodResolver(AppointmentFormValidation),
		defaultValues: {
			primaryPhysician: appointment ? appointment.primaryPhysician : "",
			schedule: appointment
				? new Date(appointment?.schedule)
				: new Date(Date.now()),
			reason: appointment ? appointment.reason : "",
			note: appointment ? appointment.note : "",
			cancellationReason: appointment?.cancellationReason || "",
		},
	});

	// Async function to handle form submission
	async function onSubmit(values: z.infer<typeof AppointmentFormValidation>) {
		setIsLoading(true); 

		let status;

		// Determine status based on the type
		switch (type) {
			case "schedule":
				status = "scheduled";
				break;
			case "cancel":
				status = "cancelled";
				break;
			default:
				status = "pending";
				break;
		}

		try {
			if (type === "create" && patientId) {
				// Prepare data for creating a new appointment
				const appointmentData = {
					userId,
					patient: patientId,
					primaryPhysician: values.primaryPhysician,
					reason: values.reason!,
					schedule: new Date(values.schedule),
					status: status as Status,
					note: values.note,
				};
				// API call to create appointment
				const appointment = await createAppointment(appointmentData);
				
				
				if (appointment) {
					// Reset form after successful creation
					form.reset(); 
					// Navigate to success page
					router.push(
						`/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`
					);
				}
			} else {
				// Prepare data for updating an existing appointment
				const appointmentToUpdate = {
					userId,
					appointmentId: appointment?.$id!,
					appointment: {
						primaryPhysician: values.primaryPhysician,
						schedule: new Date(values.schedule),
						status: status as Status,
						cancellationReason: values.cancellationReason,
					},
					type,
				};
				// API call to update appointment
				const updatedAppointment = await updateAppointment(appointmentToUpdate);

				if (updatedAppointment) {
					setOpen && setOpen(false);
					// Reset form after successful update
					form.reset();
				}
			}
		} catch (error) {
			console.log(error);
		}
		setIsLoading(false);
	}

	let buttonLabel;

	// Determine button label based on the type
	switch (type) {
		case "cancel":
			buttonLabel = "Cancel Appointment";
			break;
		case "create":
			buttonLabel = "Create Appointment";
			break;
		case "schedule":
			buttonLabel = "Schedule Appointment";
			break;
		default:
			break;
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
				{type === "create" && (
					<section className="mb-12 space-y-4">
						<h1 className="header">New Appointment</h1>
						<p className="text-dark-700">
							Request new appointment in less than 10 Sec.
						</p>
					</section>
				)}

				{type !== "cancel" && (
					<>
						<CustomFormField
							fieldType={FormFieldType.SELECT}
							control={form.control}
							name="primaryPhysician"
							label="Doctor"
							placeholder="Select a Doctor"
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

						<CustomFormField
							fieldType={FormFieldType.DATE_PICKER}
							control={form.control}
							name="schedule"
							label="Expected appointment date"
							showTimeSelect
							dateFormat="MM/dd/yyyy - h:mm aa"
						/>

						<div className="flex flex-col gap-6 xl:flex-row">
							<CustomFormField
								fieldType={FormFieldType.TEXTAREA}
								control={form.control}
								name="reason"
								label="Reason for appointment"
								placeholder="Ex:- Annual Checkup"
							/>
							<CustomFormField
								fieldType={FormFieldType.TEXTAREA}
								control={form.control}
								name="note"
								label="Notes"
								placeholder="Enter the notes"
							/>
						</div>
					</>
				)}

				{type === "cancel" && (
					<>
						<div className="flex flex-col gap-6">
							<CustomFormField
								fieldType={FormFieldType.TEXTAREA}
								control={form.control}
								name="cancellationReason"
								label="Reason for cancellation"
								placeholder="Enter the reason here"
							/>
						</div>
					</>
				)}

				<SubmitButton
					isLoading={isLoading}
					className={`${
						type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"
					} w-full`}
				>
					{buttonLabel}
				</SubmitButton>
			</form>
		</Form>
	);
};

export default AppointmentForm;
