export function runTaskWithTimeout(task: () => void, timeout: number, interval: number) {
    const intr = setInterval(task, interval);

    setTimeout(() => {
        clearInterval(intr);
    }, timeout);
}