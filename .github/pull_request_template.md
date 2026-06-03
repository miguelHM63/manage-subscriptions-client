# Pull request type

<!-- Please select the type of change your PR introduces (and remove the rest)(feature is selected by default):

- Bugfix
- Feature
- Code style update (formatting, renaming)
- Refactoring (no functional changes, no api changes)
- Build related changes
- Documentation content changes
- Other (please describe):
-->

- Feature

## Links (Jira/Trello ticket and other relevant links)

<!--- At a minimum include links to the Jira/Trello ticket
    For example: [LPAS-9](https://digheontech.atlassian.net/browse/LPAS-9)
--->

## What is the current behavior?

<!--
For example:
Currently, when navigating between steps in the patient registration form, the entered data is lost and only the final step’s input is submitted.
-->

## What is the new behavior?

<!--
For example:
Form state is now preserved across all steps using Ant Design Form’s `preserve` feature and conditional rendering. Each step retains its inputs and the final submission includes data from all previous steps.
-->

## For Testing and QA notes

<!--
For example:
1. Go to the patient registration page (`/patients/register`).
2. Fill in Step 1 (personal information) and click “Next”.
3. Navigate back to Step 1 and verify that all entered data remains.
4. Complete Steps 2 and 3, then click **Guardar**; confirm the API receives a payload containing fields from all steps.
5. Simulate a 401 error by expiring the session token and ensure the user is redirected to the login page with an appropriate message.
-->

## Preview

<!--- Paste here any image or video of the functionality (if it apply) --->
