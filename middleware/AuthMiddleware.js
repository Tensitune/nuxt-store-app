export default function ({ req, redirect }) {
  if (!req.session.user) {
    return redirect('/')
  }
}
