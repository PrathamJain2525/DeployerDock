import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SignUp />
    </div>
  );
}
