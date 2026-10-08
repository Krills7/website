export const postboard = {
  title: 'PostBoard',
  kicker: 'android.kotlin — case study',
  tagline:
    'Browse users, read their posts, and create, edit or delete your own — a small but complete Android app built with modern Kotlin architecture.',
  apk: 'postboard/PostBoard-debug.apk',
  github: 'https://github.com/Krills7',
  hint: 'debug build · requires Android 7.0+ (API 24) · enable “install unknown apps”',
  meta: ['Kotlin 2.2', 'Jetpack Compose', 'Material 3', 'Hilt + Retrofit', 'unit tested'],
  summary: {
    role: 'portfolio Android app',
    stack: 'Kotlin · Jetpack Compose · Hilt · Retrofit',
    platform: 'Android 7.0+ (API 24)',
    tested: 'JUnit + kotlinx-coroutines-test',
  },
  features: [
    {
      icon: 'users',
      title: 'User directory',
      body: 'Loads users from a REST API with avatars, usernames and addresses, plus pull-to-refresh.',
    },
    {
      icon: 'posts',
      title: 'Posts per user',
      body: "Each user's posts, sortable A→Z or Z→A, with clear empty and loading states.",
    },
    {
      icon: 'edit',
      title: 'Full CRUD',
      body: 'Create, edit and delete with validation, loading indicators and confirmation dialogs.',
    },
    {
      icon: 'refresh',
      title: 'Refresh & resync',
      body: 'Pull-to-refresh resets local changes and reloads the data straight from the API.',
    },
    {
      icon: 'storage',
      title: 'On-device persistence',
      body: 'Mutations are stored locally as JSON and merged over the API data, so the demo behaves like the real thing.',
    },
    {
      icon: 'shield',
      title: 'Tested & error-aware',
      body: 'ViewModel covered by unit tests with fakes; failures surface as snackbars instead of crashing.',
    },
  ],
  screenshots: [
    { src: 'postboard/users_list.png', alt: 'Users list screen', caption: 'Users' },
    { src: 'postboard/posts_list.png', alt: 'Posts list screen', caption: 'Posts' },
    { src: 'postboard/edit_dialog.png', alt: 'Edit post dialog', caption: 'Editing' },
    { src: 'postboard/delete_dialog.png', alt: 'Delete confirmation dialog', caption: 'Confirming' },
  ],
  tech: [
    'Kotlin',
    'Jetpack Compose',
    'Material 3',
    'MVVM + Repository',
    'StateFlow',
    'Hilt',
    'Retrofit + Gson',
    'Navigation Compose',
    'SharedPreferences',
    'Coroutines',
    'JUnit',
    'kotlinx-coroutines-test',
  ],
  dataFlow: [
    { lead: 'StateFlow', body: 'Screens collect immutable state from one ViewModel.' },
    {
      lead: 'Retrofit',
      body: 'suspend calls run off the main thread; results flow back into state.',
    },
    {
      lead: 'Repository',
      body: 'overlays local creates, edits, and deletes on top of API data.',
    },
    { lead: 'Errors', body: 'are modelled as one-shot state and shown as snackbars.' },
  ],
  layout: [
    { dir: 'data/', body: 'API service and local repository.' },
    { dir: 'di/', body: 'Hilt bindings for singletons.' },
    { dir: 'model/', body: 'plain Kotlin data classes.' },
    { dir: 'ui/', body: 'screens, components, ViewModel and theme.' },
  ],
}
