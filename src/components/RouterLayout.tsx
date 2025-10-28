import { Route } from "react-router-dom"

const RouterLayout = ({element , path}: {element: React.ReactNode , path: string}) => {
  return (
    <Route path={path} element={element} />
  )
}

export default RouterLayout