---
---
window.SITE_CONFIG = {
  name: {{ site.data.profile.name | jsonify }},
  role: {{ site.data.profile.role | jsonify }},
  email: {{ site.data.profile.email | jsonify }},
  memories: {{ site.data.memories | jsonify }}
};
