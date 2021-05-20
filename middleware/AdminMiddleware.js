export default function ({ req, redirect }) {
  if (!(req.session.user && req.session.user.admin)) {
    return redirect('/')
  }
}
