export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"

// Fetch helper: turns a non-OK response into an error with the backend's message
export function request(path, options) {
  return fetch(`${API_URL}${path}`, options)
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.error)
      return data
    })
}

export function postJson(path, body) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}
