export default function Footer() {
  return (
    <div className="mt-4 bg-[#121212] border border-gray-800 rounded-lg p-3">
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 justify-center">
        <span>
          <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-cyan-400">f</kbd>
          {' '}filter
        </span>
        <span>
          <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-cyan-400">k</kbd>
          {' '}kill
        </span>
        <span>
          <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-cyan-400">c</kbd>
          {' '}sort by cpu
        </span>
        <span>
          <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-cyan-400">m</kbd>
          {' '}sort by memory
        </span>
      </div>
    </div>
  );
}
