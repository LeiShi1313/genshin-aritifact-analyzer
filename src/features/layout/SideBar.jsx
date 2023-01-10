import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom'


const routes = [
    {
        path: '/app/users',
        icon: 'Users',
        name: 'User',
        permissions: ['admin'],
    },
    {
        path: '/app/servers',
        icon: 'Stack',
        name: 'Server',
        permissions: ['admin', 'ops', 'user'],
    },
    {
        path: '/app/file',
        icon: 'FileArrowUp',
        name: 'File Center',
        permissions: ['admin', 'ops', 'user'],
    },
    {
        path: '/app/activity',
        icon: 'Activity',
        name: 'Activity',
        permissions: ['admin', 'ops', 'user'],
    },
    {
        path: '/app/settings',
        icon: 'Gear',
        name: 'Settings',
        permissions: ['admin', 'ops', 'user'],
    },
    {
        path: '/app/about',
        icon: 'At',
        name: 'About',
        permissions: ['admin', 'ops', 'user'],
    },
]

const SideBar = () => {
    const location = useLocation()
    const { t, i18n } = useTranslation();
    return (
        <div className="drawer-side">
            <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
            <ul className="menu menu-normal bg-base-100 w-full">
                {routes.map((route, i) =>
                    // route.routes && route.permissions.includes(permission) ? (
                    //     <SidebarSubmenu route={route} key={route.name} />
                    // ) : (
                    //     route.permissions.includes(permission) ? (
                            // <Route path={route.path} exact={route.exact} element={
                            <li className="w-56" key={route.name}
                                    onClick={() => {document.getElementById('my-drawer-2').click()}}
                            >
                                <NavLink
                                    to={route.path}
                                    className="pt-3 pb-3"
                                >

                                    {/* <Icon className="w-5 h-5" aria-hidden="true" icon={route.icon} /> */}
                                    <span className="ml-4">{t(route.name)}</span>
                                </NavLink>
                            </li>
                        // ) : null)
                )}
            </ul>
        </div>

    )
}

export default SideBar;