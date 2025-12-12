
import { RoleConstants } from './Roles'

export interface EndpointPermission {
   path: string
   method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
   roles: RoleConstants[]
}

export interface RoutePermission {
   name: string
   basePath: string
   endpoints: EndpointPermission[]
}

export const RoutePermissions: RoutePermission[] = [
   {
      name: 'analysis',
      basePath: '/analysis',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
      ],
   },
   {
      name: 'analysis-parameter',
      basePath: '/analysis-parameter',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-by-analysis/:id',
            method: 'GET',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
      ],
   },
   {
      name: 'billing',
      basePath: '/billing',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/payment/:id',
            method: 'PUT',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
      ],
   },
   {
      name: 'booking',
      basePath: '/booking',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/search-patients',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-by-patient/:patient_id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/available-rooms',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
      ],
   },
   {
      name: 'corpus',
      basePath: '/corpus',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
      ],
   },
   {
      name: 'daily-checkup',
      basePath: '/daily-checkup',
      endpoints: [
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-by-patient/:patientId',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/create',
            method: 'POST',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
      ],
   },
   {
      name: 'diagnosis',
      basePath: '/diagnosis',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
      ],
   },
   {
      name: 'examination',
      basePath: '/examination',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
         {
            path: '/change-status/:id',
            method: 'PUT',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
         {
            path: '/create-prescription/:id',
            method: 'POST',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
      ],
   },
   {
      name: 'imaging-type',
      basePath: '/imaging-type',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
      ],
   },
   {
      name: 'medical-image',
      basePath: '/medical-image',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
      ],
   },
   {
      name: 'medication',
      basePath: '/medication',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.PHARMACIST,
            ],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.PHARMACIST,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.PHARMACIST,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.PHARMACIST,
            ],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.PHARMACIST,
            ],
         },
      ],
   },
   {
      name: 'neurological-status',
      basePath: '/neurological-status',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
      ],
   },
   {
      name: 'patient',
      basePath: '/patient',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.RECEPTIONIST,
            ],
         },
      ],
   },
   {
      name: 'patient-analysis',
      basePath: '/patient-analysis',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-by-patient/:patientId',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
      ],
   },
   {
      name: 'prescription',
      basePath: '/prescription',
      endpoints: [
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/create',
            method: 'POST',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
            ],
         },
         {
            path: '/mark-as-completed/:id',
            method: 'PUT',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
            ],
         },
      ],
   },
   {
      name: 'room',
      basePath: '/room',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/add-patient/:id',
            method: 'POST',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/remove-patient/:id',
            method: 'POST',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/update-leave-time/:id',
            method: 'PATCH',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.RECEPTIONIST,
            ],
         },
      ],
   },
   {
      name: 'service',
      basePath: '/service',
      endpoints: [
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/create',
            method: 'POST',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/take-item/:id',
            method: 'PATCH',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
            ],
         },
      ],
   },
   {
      name: 'service-type',
      basePath: '/service-type',
      endpoints: [
         {
            path: '/create',
            method: 'POST',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/get-all',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/get-one/:id',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
            ],
         },
         {
            path: '/update/:id',
            method: 'PUT',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/delete/:id',
            method: 'DELETE',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
      ],
   },
   {
      name: 'user',
      basePath: '/user',
      endpoints: [
         { path: '/create', method: 'POST', roles: [RoleConstants.CEO] },
         { path: '/update/:id', method: 'PUT', roles: [RoleConstants.CEO] },
         { path: '/get-all', method: 'GET', roles: [RoleConstants.CEO] },
         { path: '/delete/:id', method: 'DELETE', roles: [RoleConstants.CEO] },
         { path: '/get-one/:id', method: 'GET', roles: [RoleConstants.CEO] },
      ],
   },
   {
      name: 'auth',
      basePath: '/auth',
      endpoints: [
         {
            path: '/me',
            method: 'GET',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
               RoleConstants.PHARMACIST,
            ],
         },
         {
            path: '/update-me',
            method: 'PUT',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
               RoleConstants.PHARMACIST,
            ],
         },
         {
            path: '/update-password',
            method: 'PUT',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
               RoleConstants.PHARMACIST,
            ],
         },
      ],
   },
   {
      name: 'settings',
      basePath: '/settings',
      endpoints: [
         {
            path: '/get',
            method: 'POST',
            roles: [RoleConstants.CEO],
         },
         {
            path: '/update',
            method: 'PUT',
            roles: [RoleConstants.CEO],
         },
      ],
   },
   {
      name: 'upload',
      basePath: '/upload',
      endpoints: [
         {
            path: '/file',
            method: 'POST',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
               RoleConstants.PHARMACIST,
            ],
         },
         {
            path: '/files',
            method: 'POST',
            roles: [
               RoleConstants.CEO,
               RoleConstants.ADMIN,
               RoleConstants.DOCTOR,
               RoleConstants.NURSE,
               RoleConstants.RECEPTIONIST,
               RoleConstants.PHARMACIST,
            ],
         },
      ],
   },
   {
      name: 'report',
      basePath: '/report',
      endpoints: [
         {
            path: '/billing',
            method: 'GET',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/user',
            method: 'GET',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/patient',
            method: 'GET',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/examination',
            method: 'GET',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/analysis',
            method: 'GET',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/diagnosis',
            method: 'GET',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/doctor',
            method: 'GET',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
         {
            path: '/room',
            method: 'GET',
            roles: [RoleConstants.CEO, RoleConstants.ADMIN],
         },
      ],
   },
]

// Helper function to get roles for a specific endpoint
export const getEndpointRoles = (
   routeName: string,
   endpointPath: string,
   method: string,
): RoleConstants[] => {
   const route = RoutePermissions.find(r => r.name === routeName)
   if (!route) return [RoleConstants.CEO]

   const endpoint = route.endpoints.find(
      e => e.path === endpointPath && e.method === method,
   )
   return endpoint?.roles || [RoleConstants.CEO]
}
