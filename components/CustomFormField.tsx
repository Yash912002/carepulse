"use client";

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Control } from "react-hook-form";
import { FormFieldType } from "./forms/PatientForm";
import Image from "next/image";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { E164Number } from "libphonenumber-js/core";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";

// Interface for custom form field properties
interface CustomProps {
	control: Control<any>;
	fieldType: FormFieldType;
	name: string;
	label?: string;
	placeholder?: string;
	iconSrc?: string;
	iconAlt?: string;
	disabled?: boolean;
	dateFormat?: string;
	showTimeSelect?: boolean;
	children?: React.ReactNode;
	renderSkeleton?: (field: any) => React.ReactNode;
}

// RenderField component to render different form fields based on field type
const RenderField = ({ field, props }: { field: any; props: CustomProps }) => {
	const {
		control,
		fieldType,
		name,
		label,
		placeholder,
		iconSrc,
		iconAlt,
		showTimeSelect,
		dateFormat,
		renderSkeleton,
	} = props;

	switch (fieldType) {
		case FormFieldType.INPUT:
			return (
				// Render input field with optional icon
				<div className="flex rounded-md border border-dark-500 bg-dark-400">
					{iconSrc && (
						<Image
							src={iconSrc}
							height={24}
							width={24}
							alt={iconAlt || ""}
							className="ml-2"
						/>
					)}
					<FormControl>
						<Input
							placeholder={placeholder}
							{...field}
							className="shad-input border-0"
						/>
					</FormControl>
				</div>
			);
		case FormFieldType.TEXTAREA:
			return (
				// Render textarea
				<FormControl>
					<Textarea
						placeholder={placeholder}
						{...field}
						className="shad-textArea"
						disabled={props.disabled}
					/>
				</FormControl>
			);
		case FormFieldType.PHONE_INPUT:
			return (
				// Render phone input field
				<FormControl>
					<PhoneInput
						defaultCountry="IN"
						placeholder={placeholder}
						international
						withCountryCallingCode
						value={field.value as E164Number | undefined}
						onChange={field.onChange}
						className="input-phone"
					/>
				</FormControl>
			);
		case FormFieldType.DATE_PICKER:
			return (
				// Render date picker with optional time selection
				<div className="flex rounded-md border border-dark-500 bg-dark-400">
					<Image
						src="/assets/icons/calendar.svg"
						height={24}
						width={24}
						alt="calendar"
						className="ml-2"
					/>
					<FormControl>
						<DatePicker
							selected={field.value}
							onChange={(date) => field.onChange(date)}
							dateFormat={dateFormat ?? "MM/dd/yyyy"}
							showTimeSelect={showTimeSelect ?? false}
							timeInputLabel="Time:"
							wrapperClassName="date-picker"
						/>
					</FormControl>
				</div>
			);
		case FormFieldType.SELECT:
			return (
				// Render select dropdown
				<FormControl>
					<Select onValueChange={field.onChange} defaultValue={field.value}>
						<FormControl>
							<SelectTrigger className="shad-select-trigger">
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>
						</FormControl>
						<SelectContent className="shad-select-content">
							{props.children}
						</SelectContent>
					</Select>
				</FormControl>
			);
		case FormFieldType.SKELETON:
			// Render skeleton if provided
			return renderSkeleton ? renderSkeleton(field) : null;
		case FormFieldType.CHECKBOX:
			return (
				// Render checkbox
				<FormControl>
					<div className="flex items-center gap-4">
						<Checkbox
							id={props.name}
							checked={field.value}
							onCheckedChange={field.onChange}
						/>
						<label htmlFor={props.name} className="checkbox-label">
							{props.label}
						</label>
					</div>
				</FormControl>
			);
		default:
			break;
	}
};

// CustomFormField component to handle form fields rendering
const CustomFormField = (props: CustomProps) => {
	const { control, fieldType, name, label } = props;
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className="flex-1">
					{fieldType !== FormFieldType.CHECKBOX && label && (
						<FormLabel>{label}</FormLabel>
					)}
					<RenderField field={field} props={props} />
					<FormMessage className="shad-error" />
				</FormItem>
			)}
		/>
	);
};

export default CustomFormField;
