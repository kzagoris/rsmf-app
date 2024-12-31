import { signInWithEmailAndPassword, signOut, User } from "firebase/auth"
import { setupFirebase, useAuth } from "lib/firebase"
import { createContext, ReactNode, useContext, useReducer } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { UserRoleType } from "~/models/User"

type AuthActions = { type: "SIGN_IN"; payload: { user: User; role: UserRoleType } } | { type: "SIGN_OUT" }

export type AuthState = {
    state: "SIGNED_IN" | "SIGNED_OUT" | "UNKNOWN"
    currentUser?: User | null
    role?: UserRoleType
}

const AuthReducer = (state: AuthState, action: AuthActions): AuthState => {
    switch (action.type) {
        case "SIGN_IN":
            return {
                state: "SIGNED_IN",
                currentUser: action.payload.user,
                role: action.payload.role,
            }
        case "SIGN_OUT":
            return {
                state: "SIGNED_OUT",
            }
    }
}

type AuthContextProps = {
    state: AuthState
    dispatch: (value: AuthActions) => void
}

export const AuthContext = createContext<AuthContextProps>({
    state: { state: "UNKNOWN" },
    dispatch: (val) => {},
})
setupFirebase()

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(AuthReducer, { state: "UNKNOWN" })
    const [] = useAuthState(useAuth(), {
        onUserChanged: async (user) => {
            if (user) {
                const role: UserRoleType = (await user.getIdTokenResult(true)).claims.role ?? "student"
                dispatch({ type: "SIGN_IN", payload: { user, role } })
            } else {
                dispatch({ type: "SIGN_OUT" })
            }
        },
    })

    return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>
}

const useUserContext = () => {
    return useContext(AuthContext)
}

const useSignIn = () => {
    const { dispatch } = useContext(AuthContext)
    return {
        signIn: async (email: string, password: string) => {
            const user = await signInWithEmailAndPassword(useAuth(), email, password)
            const role: UserRoleType = (await user.user.getIdTokenResult(true)).claims.role ?? "student"

            dispatch({ type: "SIGN_IN", payload: { user: user.user, role } })
        },
    }
}

const useSignOut = () => {
    const { dispatch } = useContext(AuthContext)
    return {
        signOut: async () => {
            await signOut(useAuth())
            dispatch({ type: "SIGN_OUT" })
        },
    }
}

export { useUserContext, useSignIn, useSignOut, AuthProvider }
