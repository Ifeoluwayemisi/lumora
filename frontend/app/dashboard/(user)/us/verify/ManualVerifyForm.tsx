export default function ManualVerifyForm({
  productCode,
  setProductCode,
  loading,
  onVerify,
}: any) {
  return (
    <form onSubmit={onVerify} className="space-y-6">
      <input
        value={productCode}
        onChange={(e) => setProductCode(e.target.value.toUpperCase())}
        placeholder="LUM-882-991-001"
        className="w-full bg-black p-4 rounded-xl text-center tracking-widest"
      />
      <button
        disabled={loading || !productCode}
        className="w-full bg-green-600 py-4 rounded-xl font-bold"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}
