---
layout: default
title: News
---

<div class="page-content">
  <div class="news-content">
    <h1>News</h1>
    
    <p class="news-intro">
      Latest updates and news from the Cognitive Systems Lab.
    </p>

    {% if site.posts.size > 0 %}
      <div class="news-list">
        {% for post in site.posts limit:10 %}
          <article class="news-item">
            <div class="news-item-header">
              <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
              <time class="news-date">{{ post.date | date: "%B %d, %Y" }}</time>
            </div>
            {% if post.excerpt %}
              <div class="news-excerpt">
                {{ post.excerpt }}
              </div>
            {% endif %}
          </article>
        {% endfor %}
      </div>
    {% else %}
      <p class="news-empty">No news posts yet. Check back soon!</p>
    {% endif %}
  </div>
</div>
