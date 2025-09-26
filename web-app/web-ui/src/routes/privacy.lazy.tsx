import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/privacy')({
  component: Privacy,
})

function Privacy() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 flex-grow">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-gray-700">
          <p>
            Your privacy is important to us. It is Car-Safar's policy to respect
            your privacy regarding any information we may collect from you across
            our website, and other sites we own and operate.
          </p>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Information we collect</h2>
            <p>
              We only ask for personal information when we truly need it to provide a
              service to you. We collect it by fair and lawful means, with your
              knowledge and consent. We also let you know why we’re collecting it
              and how it will be used.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">How we use your information</h2>
            <p>
              We only retain collected information for as long as necessary to
              provide you with your requested service. What data we store, we’ll
              protect within commercially acceptable means to prevent loss and
              theft, as well as unauthorized access, disclosure, copying, use or
              modification.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Sharing your information</h2>
            <p>
              We don’t share any personally identifying information publicly or with
              third-parties, except when required to by law.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Your rights</h2>
            <p>
              You are free to refuse our request for your personal information, with
              the understanding that we may be unable to provide you with some of
              your desired services.
            </p>
          </div>
          <p>
            Your continued use of our website will be regarded as acceptance of
            our practices around privacy and personal information. If you have any
            questions about how we handle user data and personal information,
            feel free to contact us. For any complaints, please contact our helpline at <a href="mailto:admin@car-safar.com" className="text-blue-600 hover:underline">admin@car-safar.com</a>.
          </p>
          <p className="text-sm text-gray-500 text-center pt-4">This policy is effective as of 25 September 2025.</p>
        </div>
      </div>
    </div>
  )
}
