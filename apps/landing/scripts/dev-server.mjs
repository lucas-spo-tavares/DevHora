import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(scriptDir, "..", "public");
const port = Number(process.env.PORT || 4173);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".apk", "application/vnd.android.package-archive"]
]);

createServer(async (request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);
  const cleanPath = path.normalize(decodeURIComponent(requestUrl.pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, cleanPath === "/" ? "index.html" : cleanPath);

  try {
    const fileStat = await stat(filePath);
    const finalPath = fileStat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    response.setHeader("Content-Type", contentTypes.get(path.extname(finalPath)) || "application/octet-stream");
    createReadStream(finalPath).pipe(response);
  } catch {
    response.statusCode = 404;
    response.end("Not found");
  }
}).listen(port, () => {
  console.log(`DevHora landing running at http://localhost:${port}`);
});
