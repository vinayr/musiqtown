import webapp2

class MainPage(webapp2.RequestHandler):

    def get(self):
        f = open('index.html', 'r')
        self.response.headers['Content-Type'] = 'text/html'
        self.response.write(f.read());

application = webapp2.WSGIApplication([
    ('/', MainPage),
], debug=True)
