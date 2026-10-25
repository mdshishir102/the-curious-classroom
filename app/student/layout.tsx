import DeviceGuard from "./DeviceGuard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DeviceGuard />
      {children}
    </>
  );
}