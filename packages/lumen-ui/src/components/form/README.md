# Form

`Form` checks all fields in one synchronous validation pass when submitted.
It shares errors with named `FormField` children and calls `onFinish` only if
no non-empty error messages remain. Values stay owned by the caller.

```tsx
const [values, setValues] = useState({ name: '', email: '' });

<Form
  values={values}
  validate={(current) => ({
    name: current.name.trim() ? undefined : 'Enter a name',
    email: current.email.includes('@') ? undefined : 'Enter an email',
  })}
  onFinish={async (current) => saveUser(current)}
  onReset={() => setValues({ name: '', email: '' })}
>
  {({ errors, isSubmitting, submitError }) => <>
    {Object.keys(errors).length > 0 && <p role="alert">Please correct all highlighted fields.</p>}
    <FormField name="name" label="Name" required>
      {(props) => <Input {...props} value={values.name}
        onChange={(event) => setValues({ ...values, name: event.target.value })} />}
    </FormField>
    <FormField name="email" label="Email" required>
      {(props) => <Input {...props} type="email" value={values.email}
        onChange={(event) => setValues({ ...values, email: event.target.value })} />}
    </FormField>
    <Button type="submit" disabled={isSubmitting}>Submit</Button>
    <Button type="reset" disabled={isSubmitting}>Reset</Button>
    {Boolean(submitError) && <p role="alert">Submission failed. Please retry.</p>}
  </>}
</Form>
```

- `validate` receives the complete values object, including for cross-field rules.
  Native validation popups are disabled so every error can appear together.
  Express all required, format, and cross-field checks in `validate`; `required`
  on a field alone does not add a rule. Validation runs on submit, not on editing.
- Spread the `FormField` render props onto the input to connect the label, name,
  invalid styling, and error description. Explicit `error` props take precedence.
- Failed validation focuses the first available control in an invalid FormField
  in document order. Set `focusFirstError={false}` to manage focus yourself.
- `onFinish` can return a promise. `isSubmitting` remains true until it settles,
  and duplicate submits and resets are blocked during that interval. Disable
  editable controls using this state if values should remain fixed during save.
- Validation and submission exceptions are exposed as `submitError`. Render
  appropriate feedback through the child render function; retry clears the error.
- Reset clears validation feedback. Reset controlled values in `onReset`;
  preventing that event also preserves validation feedback.
