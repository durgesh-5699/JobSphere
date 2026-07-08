export async function retryAsync<T>(
    fn: () => Promise<T>,
    options?: {
        retries?: number;
        delayMs?: number;
        isValid?: (result: T) => boolean;
    }
): Promise<T> {
    const retries = options?.retries ?? 3;
    const delayMs = options?.delayMs ?? 1000;
    const isValid = options?.isValid ?? (() => true);

    let lastError: any = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await fn();
            if (isValid(result)) {
                if (attempt > 1) {
                    console.log(`Succeeded on attempt ${attempt}/${retries}`);
                }
                return result;
            }
            lastError = new Error("Result failed validation check.");
            console.warn(`Attempt ${attempt}/${retries} returned invalid result. Retrying...`);
        } catch (err: any) {
            lastError = err;
            console.warn(`Attempt ${attempt}/${retries} threw an error:`, err.message);
        }
        if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delayMs * attempt)); // linear backoff
        }
    }

    throw new Error(
        `Failed after ${retries} attempts. Last error: ${lastError?.message || "Unknown error"}`
    );
}