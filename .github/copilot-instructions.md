# Jayron Medikare - AI Coding Agent Instructions

## Project Overview

Healthcare management system (Medikare) built with React, TypeScript, Vite, shadcn/ui, and RTK Query. Supports multilingual UI (Uzbek Cyrillic, Uzbek Latin, English) with role-based access control.

## Architecture Patterns

### State Management & API

- **RTK Query with code splitting**: All API endpoints use `baseApi.injectEndpoints()` pattern (see [../src/app/api/baseApi/baseApi.ts](../src/app/api/baseApi/baseApi.ts))
- Each domain has its own API file: `src/app/api/{domain}Api/*.ts`
- Endpoints auto-generate hooks like `useGetAllServiceQuery`, `useCreateServiceMutation`
- **API Tags** for cache invalidation defined in [../src/constants/apiTags.ts](../src/constants/apiTags.ts)
- Use `providesTags` and `invalidatesTags` for automatic cache updates
- Example API pattern:
  ```typescript
  export const serviceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
      getAllService: builder.query<Response, Params>({
        query: (params) => ({ url: PATHS.GET_ALL, params }),
        providesTags: [API_TAGS.SERVICE],
      }),
    }),
  });
  ```

### Authentication & Authorization

- Token stored in localStorage via `baseApi.ts` automatic caching
- **Role-Based Security (RBS)**: Use hooks from [../src/hooks/RBS/](../src/hooks/RBS/) for permission checks
- `usePermission(collectionName)` returns `{ canCreate, canRead, canUpdate, canDelete }`
- `useRouteActions(path)` checks route-level permissions per HTTP method
- Route permissions defined in [../src/constants/route-permissions.ts](../src/constants/route-permissions.ts) with roles
- Always wrap protected routes with `<RouteProtection path="/route" />` component
- Biometric endpoints skip auth (check `isBiometricEndpoint` logic in baseApi)

### UI Components

- **shadcn/ui**: All components in [../src/components/ui/](../src/components/ui/) use `cn()` utility from [../src/lib/utils.ts](../src/lib/utils.ts)
- `cn()` merges Tailwind classes with `twMerge(clsx(...))` - always use for conditional styling
- Custom theme extends default Tailwind with HSL color variables (primary, success, warning, danger)
- Form validation uses `react-hook-form` + `zod` (validation schemas in `src/validation/`)

### Internationalization

- i18next with namespace-based translations: [../src/i18n/locales/{lang}/{namespace}.json](../src/i18n/locales/)
- Three languages: `uz-Cyrl`, `uz-Latn`, `en`
- Use `const { t } = useTranslation('namespace')` then `t('key')`
- Sidebar menu items use `titleKey` property for translation (see [../src/constants/Sidebar.ts](../src/constants/Sidebar.ts))

### Routing

- React Router with `RouteConfig[]` array in [../src/router.tsx](../src/router.tsx)
- Each route has `permission` field (null = public, string = permission key)
- Routes auto-protected via `RouteProtection` component based on RBS system
- Permission-to-route mapping in [../src/hooks/usePermission.ts](../src/hooks/usePermission.ts)

## Development Workflows

### Running the Project

```bash
yarn dev          # Start dev server on port 8080
yarn build        # Production build
yarn build:dev    # Development build
yarn lint         # ESLint check
yarn preview      # Preview production build
```

### Adding New API Endpoints

1. Create API file: `src/app/api/{domain}Api/{name}Api.ts`
2. Use `baseApi.injectEndpoints()` pattern
3. Add API tag to [../src/constants/apiTags.ts](../src/constants/apiTags.ts) if new domain
4. Export auto-generated hooks: `export const { useGetQuery, useMutation } = api`

### Adding Protected Routes

1. Add route config to [../src/router.tsx](../src/router.tsx) with `permission` key
2. Add permission mappings to [../src/constants/route-permissions.ts](../src/constants/route-permissions.ts)
3. Update [../src/hooks/usePermission.ts](../src/hooks/usePermission.ts) collection mapping if CRUD needed
4. Add sidebar menu item to [../src/constants/Sidebar.ts](../src/constants/Sidebar.ts) with `permission` field

### Creating New Pages

- Place in `src/pages/{Feature}/` directory
- Use `usePermission('collectionName')` for action-level permissions
- Use `useHandleRequest()` hook from [../src/hooks/Handle_Request/](../src/hooks/Handle_Request/) for error handling
- Follow pagination pattern: RTK Query with `{ page, limit, search }` params
- Toasts via `sonner` library: `toast.success()`, `toast.error()`

## Critical Conventions

### TypeScript Configuration

- Path alias: `@/*` maps to `src/*` (configured in [../vite.config.ts](../vite.config.ts) and [../tsconfig.json](../tsconfig.json))
- Relaxed strictness: `noImplicitAny: false`, `strictNullChecks: false` (legacy, gradually improving)
- Always import from `@/` instead of relative paths

### TypeScript Rules - MANDATORY

**NEVER use `any` type - always define proper types:**

1. **API Response Types**: Create interfaces for all API responses

   ```typescript
   // ✅ CORRECT
   interface Patient {
     _id: string;
     name: string;
     phone: string;
     date_of_birth?: Date;
     // ... other fields
   }

   // ❌ WRONG
   const patient: any = data;
   ```

2. **Component Props**: Always type component props

   ```typescript
   // ✅ CORRECT
   interface PatientPDFProps {
     patient: Patient;
     exams?: Examination[];
   }

   // ❌ WRONG
   interface PatientPDFProps {
     patient: any;
     exams?: any[];
   }
   ```

3. **Function Parameters**: Type all parameters

   ```typescript
   // ✅ CORRECT
   const handleChange = (field: keyof Patient, value: string | number) => {
     setFormData((prev) => ({ ...prev, [field]: value }));
   };

   // ❌ WRONG
   const handleChange = (field: string, value: any) => {
     setFormData((prev) => ({ ...prev, [field]: value }));
   };
   ```

4. **Array Methods**: Type callback parameters using existing interfaces

   ```typescript
   // ✅ CORRECT
   doctors.map((doctor: Doctor) => ({
     value: doctor._id,
     label: doctor.name,
   }));

   // ❌ WRONG
   doctors.map((doctor: any) => ({
     value: doctor._id,
     label: doctor.name,
   }));
   ```

5. **Error Handling**: Use proper error typing

   ```typescript
   // ✅ CORRECT
   try {
     await createPatient(data);
   } catch (error) {
     if (error instanceof Error) {
       toast.error(error.message);
     } else {
       toast.error('Unknown error occurred');
     }
   }

   // ❌ WRONG
   try {
     await createPatient(data);
   } catch (error: any) {
     toast.error(error.message);
   }
   ```

6. **Common Types Location**: Define shared types in domain API type files

   - Patient types → `src/app/api/patientApi/types.ts`
   - Examination types → `src/app/api/examinationApi/types.ts`
   - Service types → `src/app/api/serviceApi/types.ts`
   - Import and reuse: `import { Patient } from '@/app/api/patientApi/types'`

7. **When Backend Response is Unknown**: Use `unknown` and validate

   ```typescript
   // ✅ CORRECT
   const data: unknown = await fetchData();
   if (isPatient(data)) {
     // now data is Patient type
   }

   // ❌ WRONG
   const data: any = await fetchData();
   data.name; // unsafe
   ```

8. **Generic Object Updates**: Use Record or specific types

   ```typescript
   // ✅ CORRECT
   const submitData: Partial<Patient> = {
     name: formData.name,
     phone: formData.phone,
   };

   // ❌ WRONG
   const submitData: any = {
     name: formData.name,
     phone: formData.phone,
   };
   ```

### Naming & Structure

- API hooks: `use{Action}{Entity}Query/Mutation` (e.g., `useGetAllServiceQuery`)
- Components: PascalCase files, export default
- Constants: UPPER_SNAKE_CASE enums (e.g., `API_TAGS.SERVICE`)
- Translations: camelCase keys, namespaced (e.g., `sidebar.menu.patientList`)

### Phone Number Formatting

- Use `formatPhoneNumber()` from [../src/lib/utils.ts](../src/lib/utils.ts) - formats to `+998 92 694 42 47`
- Assumes Uzbekistan numbers starting with 998

### Number Input Handling

- Always prevent leading zeros in number inputs (e.g., 03 should become 3)
- Parse values using `parseInt(value, 10)` with radix 10 to avoid octal interpretation
- Handle empty strings by displaying empty input (not 0) for better UX
- When user clears input completely, set state to 0 but display empty string
- Example pattern:

  ```tsx
  // In component state
  const [fieldValue, setFieldValue] = useState(7);

  // In JSX
  <Input
    type='number'
    value={fieldValue === 0 ? '' : fieldValue}
    onChange={(e) => {
      const value = e.target.value;
      if (value === '') {
        setFieldValue(0);
        return;
      }
      // Prevent leading zeros and ensure minimum value
      const numValue = Math.max(1, parseInt(value, 10) || 1);
      setFieldValue(numValue);
    }}
  />;
  ```

### Permission Checks in UI

```tsx
const { canCreate, canUpdate, canDelete } = usePermission('patients');

{
  canCreate && <Button>Create</Button>;
}
{
  canUpdate && <EditButton />;
}
```

### RTK Query Cache Strategy

- Use `providesTags` on queries to mark cached data
- Use `invalidatesTags` on mutations to auto-refetch
- Tags defined in [API_TAGS enum](../src/constants/apiTags.ts)
- Token auto-cached in localStorage by baseApi on login response

## Integration Points

### External Dependencies

- **Backend API**: Configured via `SERVER_URL` in [../src/constants/ServerUrl.ts](../src/constants/ServerUrl.ts)
- **PDF Generation**: `@react-pdf/renderer` for reports (see [../src/components/PDF/](../src/components/PDF/))
- **Charts**: Recharts library (see [../src/components/Reports/](../src/components/Reports/))
- **File Uploads**: XLSX parsing with `xlsx` library ([../src/types/xlsx.d.ts](../src/types/xlsx.d.ts) for types)

### Key Service Boundaries

- **Authentication**: [../src/app/api/authApi/](../src/app/api/authApi/) - login, me, updateMe
- **Patients**: [../src/app/api/patientApi/](../src/app/api/patientApi/) - patient CRUD
- **Examinations**: [../src/app/api/examinationApi/](../src/app/api/examinationApi/) - medical visits
- **Billing**: [../src/app/api/billingApi/](../src/app/api/billingApi/) - payments & invoices
- **Templates**: Service & prescription templates for quick workflows

### Data Flow Example

1. User action triggers mutation hook (e.g., `useCreatePatientMutation()`)
2. Mutation hits baseApi → adds auth token → calls backend
3. Success response updates localStorage cache via `updateCache()`
4. Mutation invalidates tags (e.g., `API_TAGS.PATIENTS`)
5. RTK Query auto-refetches queries with those tags
6. UI updates reactively via React-Redux

## Common Pitfalls

- Don't manually manage auth tokens - baseApi handles it automatically
- Always check permission before showing actions - use `usePermission()` hook
- Biometric endpoints need special handling (skip auth in baseApi)
- Translations must exist in ALL three language files or will show key
- Route permissions are method-specific (GET vs POST) - check [route-permissions.ts](../src/constants/route-permissions.ts)

## Testing & Debugging

- Check RTK Query DevTools in Redux DevTools extension
- Console logs in baseApi show URL and auth status
- Permission denied? Check user role in `useMeQuery()` response
- Translation missing? Verify key exists in `src/i18n/locales/{lang}/{namespace}.json`
