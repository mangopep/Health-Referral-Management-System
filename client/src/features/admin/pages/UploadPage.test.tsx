import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import UploadPage from "./UploadPage";
import * as apiModule from "@/lib/api";
import { useReferrals } from "@/app/providers/ReferralsProvider";

// Mock the dependencies
vi.mock("@/lib/api", () => ({
    apiClient: vi.fn(),
}));

vi.mock("@/app/providers/ReferralsProvider", () => ({
    useReferrals: vi.fn(),
}));

// Mock UI components that might cause issues in tests
vi.mock("@/shared/ui/primitives/card", () => ({
    Card: ({ children, className }: any) => <div className={className}>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <div>{children}</div>,
    CardDescription: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/shared/ui/primitives/button", () => ({
    Button: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

describe("UploadPage", () => {
    const mockRefresh = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useReferrals as any).mockReturnValue({ refresh: mockRefresh });
    });

    it("uploads the file with the correct payload structure", async () => {
        render(<UploadPage />);

        // Create a mock JSON file
        const mockData = [{ referral_id: "ref1" }, { referral_id: "ref2" }];
        const file = new File([JSON.stringify(mockData)], "referrals.json", {
            type: "application/json",
        });
        // Mock text method for JSDOM
        (file as any).text = async () => JSON.stringify(mockData);

        // Find the input and upload the file
        // The input is hidden and has no label, so we use direct DOM query
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

        // Use fireEvent.change on the input
        fireEvent.change(fileInput!, { target: { files: [file] } });

        // Wait for the file to be processed and "Upload Data" button to appear
        const uploadButton = await screen.findByText("Upload Data");

        // Click upload
        fireEvent.click(uploadButton);

        // Wait for upload to complete (includes 1s delay in component)
        await waitFor(() => {
            expect(apiModule.apiClient).toHaveBeenCalled();
        }, { timeout: 2000 });

        // Verify the payload
        // The bug is that it currently sends { events: [...] }
        expect(apiModule.apiClient).toHaveBeenCalledWith("/uploads", expect.objectContaining({
            method: "POST",
            body: JSON.stringify(mockData) // This EXPECTATION should fail if the bug exists.
            // Wait, if the bug is present, it sends JSON.stringify({ events: mockData })
            // So checking for JSON.stringify(mockData) should FAIL.
            // This confirms reproduction.
        }));
    });
});
