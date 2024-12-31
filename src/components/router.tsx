import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from "react-router-dom"
import ProtectedView from "~/views/ProtectedView"
import AdminProtectedView from "~/views/AdminProtectedView"
import { lazy } from "react"
import { Main } from "~/views/Main"
import NotLoginView from "~/views/NotLoginView"

const SignIn = lazy(() => import("~/views/SignIn"))
const SignUp = lazy(() => import("~/views/SignUp"))
const IdentificationSteps = lazy(() => import("~/views/IdentificationSteps"))
const CourseCreate = lazy(() => import("~/views/CourseCreate"))
const CoursesList = lazy(() => import("~/views/CoursesList"))
const CourseView = lazy(() => import("~/views/CourseView"))
const CoursesManagement = lazy(() => import("~/views/CoursesManagement"))
const UsersManagement = lazy(() => import("~/views/UsersManagement"))
const UserProfile = lazy(() => import("~/views/UserProfile"))
const UserCreate = lazy(() => import("~/views/UserCreate"))
const UserView = lazy(() => import("~/views/UserView"))
const Dashboard = lazy(() => import("~/views/Dashboard"))
const VideoExam = lazy(() => import("~/views/VideoExamView"))
export const RMFRouter = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Main />}>
            <Route
                key="1"
                index
                element={
                    <ProtectedView>
                        <Dashboard />
                    </ProtectedView>
                }
            />
            <Route
                key="2"
                path="/video-exam/:courseId"
                element={
                    <ProtectedView>
                        <VideoExam />
                    </ProtectedView>
                }
            />
            <Route
                key="3"
                path="/courses/management"
                element={
                    <AdminProtectedView>
                        <CoursesManagement />
                    </AdminProtectedView>
                }
            />
            <Route
                key="4"
                path="/courses/create/:courseId?"
                element={
                    <AdminProtectedView>
                        <CourseCreate />
                    </AdminProtectedView>
                }
            />
            <Route
                key="5"
                path="/courses/view/:courseId?"
                element={
                    <AdminProtectedView>
                        <CourseView />
                    </AdminProtectedView>
                }
            />
            <Route
                key="6"
                path="/courses/list"
                element={
                    <AdminProtectedView>
                        <CoursesList />
                    </AdminProtectedView>
                }
            />
            <Route
                key="7"
                path="/users/management"
                element={
                    <AdminProtectedView>
                        <UsersManagement />
                    </AdminProtectedView>
                }
            />
            <Route
                key="8"
                path="/user/create/:userId?"
                element={
                    <AdminProtectedView>
                        <UserCreate />
                    </AdminProtectedView>
                }
            />
            <Route
                key="9"
                path="/user/view/:userId?"
                element={
                    <AdminProtectedView>
                        <UserView />
                    </AdminProtectedView>
                }
            />
            <Route
                key="10"
                path="/signin"
                element={
                    <NotLoginView>
                        <SignIn />
                    </NotLoginView>
                }
            />
            <Route
                key="11"
                path="/signup"
                element={
                    <NotLoginView>
                        <SignUp />
                    </NotLoginView>
                }
            />
            <Route
                key="12"
                path="/identification"
                element={
                    <ProtectedView>
                        <IdentificationSteps />
                    </ProtectedView>
                }
            />
            <Route
                key="13"
                path="/profile/:userId?"
                element={
                    <ProtectedView>
                        <UserProfile />
                    </ProtectedView>
                }
            />
            <Route key="14" path="*" element={<Navigate to="/" />} />
        </Route>,
    ),
)
