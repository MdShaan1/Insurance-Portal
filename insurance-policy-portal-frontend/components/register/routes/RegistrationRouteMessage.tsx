export default function RegistrationRouteMessage({ message }: { message: string }) {
  if (!message) return null;
  return <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>;
}
