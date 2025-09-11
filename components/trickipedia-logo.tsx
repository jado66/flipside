import Link from "next/link";

export function TrickipediaLogo() {
  return (
    <Link href="/">
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center">
          <div className="flex-shrink-0 flex items-center justify-center mr-3">
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-black font-serif text-2xl">T</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl text-black uppercase font-serif">
              <span>
                <span style={{ fontSize: "1.3em", verticalAlign: "middle" }}>
                  T
                </span>
                <span
                  style={{
                    verticalAlign: "middle",
                    position: "relative",
                    top: "2px",
                  }}
                >
                  rickipedi
                </span>
                <span style={{ fontSize: "1.3em", verticalAlign: "middle" }}>
                  A
                </span>
              </span>
            </span>
            <span
              className="text-base text-muted-foreground font-serif italic"
              style={{ marginTop: "-4px" }}
            >
              The trick encyclopedia
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
