import { afterEach, describe, expect, it, vi } from "vitest"
import { loginFormErrors, readSession, signIn, signOut } from "./session.js"

describe("loginFormErrors", () => {
  it("requires email and password", () => {
    expect(loginFormErrors({ email: "  ", password: "" })).toEqual({
      email: "Enter your email",
      password: "Enter your password"
    })
  })

  it("returns no errors when both fields are present", () => {
    expect(loginFormErrors({ email: "hr@acme.test", password: "password" })).toEqual({})
  })

  it("rejects an invalid email", () => {
    expect(loginFormErrors({ email: "not-an-email", password: "password" })).toEqual({
      email: "Enter a valid email"
    })
  })
})

describe("session requests", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("returns null when the session is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 401 })))

    expect(await readSession()).toBeNull()
  })

  it("returns the signed-in user", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ user: { email: "hr@acme.test" }, csrf_token: "t" }), { status: 200 })
      )
    )

    expect(await readSession()).toEqual({ email: "hr@acme.test" })
  })

  it("signs in with email and password", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: { email: "hr@acme.test" } }), { status: 201 })
    )
    vi.stubGlobal("fetch", fetchMock)

    await signIn({ email: "hr@acme.test", password: "password" })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/session",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "hr@acme.test", password: "password" })
      })
    )
  })

  it("raises the API error on a failed sign in", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 })
      )
    )

    await expect(signIn({ email: "hr@acme.test", password: "nope" })).rejects.toThrow(
      "Invalid email or password"
    )
  })

  it("signs out", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ csrf_token: "n" }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await signOut()

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/session", expect.objectContaining({ method: "DELETE" }))
  })

  it("treats an expired session as already signed out", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 401 })))

    await expect(signOut()).resolves.toBeUndefined()
  })

  it("raises when the session check fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 500 })))

    await expect(readSession()).rejects.toThrow("Could not check the session")
  })
})
