---
layout: default
title: Blog
---

<div class="page-content">
# Blog Posts

{% for post in site.posts %}
## [{{ post.title }}]({{ post.url | relative_url }})

{{ post.date | date: "%B %d, %Y" }}

{{ post.excerpt }}

---
{% endfor %}
</div>
