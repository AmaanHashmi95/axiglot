export default function CancelPage() {
    return (
      <main className="h-screen flex justify-center items-center">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-[#ff8a00]">Payment Failed</h1>
          <p>Looks like your payment didn’t go through.</p>
          <p>
            Please try{" "}
            <a href="/signup" className="text-[#00E2FF] underline">
              signing up
            </a>{" "}
            again.
          </p>
        </div>
      </main>
    );
  }
  