"use client";

import {
	getPaginationRowModel,
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { decryptKey } from "@/lib/utils";

// Interface for DataTable props with generic types
interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

// DataTable component with generic types
export function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	// Retrieve encrypted access key from local storage
	const encryptedKey =
		typeof window !== "undefined"
			? window.localStorage.getItem("accessKey")
			: null;

	useEffect(() => {
		// Decrypt the access key and validate it
		const accessKey = encryptedKey && decryptKey(encryptedKey);

		if (accessKey !== process.env.NEXT_PUBLIC_ADMIN_PASSKEY!.toString()) {
			redirect("/"); // Redirect if access key is invalid
		}
	}, [encryptedKey]);

	// Initialize table using useReactTable hook
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div className="data-table">
			<Table className="shad-table">
				<TableHeader className=" bg-dark-200">
					{table.getHeaderGroups().map((headerGroup) => (
						// Render header rows
						<TableRow key={headerGroup.id} className="shad-table-row-header">
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
											  )}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							// Render data rows
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
								className="shad-table-row"
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<div className="table-actions">
				{/* Button to go to previous page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
					className="shad-gray-btn"
				>
					<Image
						src="/assets/icons/arrow.svg"
						width={24}
						height={24}
						alt="arrow"
					/>
				</Button>
				{/* Button to go to next page */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
					className="shad-gray-btn"
				>
					<Image
						src="/assets/icons/arrow.svg"
						width={24}
						height={24}
						alt="arrow"
						className="rotate-180"
					/>
				</Button>
			</div>
		</div>
	);
}
