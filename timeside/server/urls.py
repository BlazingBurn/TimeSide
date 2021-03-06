# -*- coding: utf-8 -*-

from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from rest_framework import routers
from timeside.server import views
from timeside.server.utils import TS_ENCODERS_EXT

EXPORT_EXT = "|".join(TS_ENCODERS_EXT.keys())

admin.autodiscover()

api_router = routers.DefaultRouter()
api_router.register(r'selections', views.SelectionViewSet)
api_router.register(r'items', views.ItemViewSet)
api_router.register(r'experiences', views.ExperienceViewSet)
api_router.register(r'processors', views.ProcessorViewSet)
api_router.register(r'subprocessors', views.SubProcessorViewSet)
api_router.register(r'results', views.ResultViewSet)
api_router.register(r'presets', views.PresetViewSet)
api_router.register(r'tasks', views.TaskViewSet)
api_router.register(r'users', views.UserViewSet)
api_router.register(r'analysis', views.AnalysisViewSet)
api_router.register(r'analysis_tracks', views.AnalysisTrackViewSet,
                    base_name='analysistrack')
api_router.register(r'annotation_tracks', views.AnnotationTrackViewSet)
api_router.register(r'annotations', views.AnnotationViewSet)

urlpatterns = [
    # ----- ADMIN -------
    url(r'^admin/', include(admin.site.urls)),
    # ----- API ---------
    url(r'^api/', include(api_router.urls)),
    url(r'^api/items/(?P<uuid>[0-9a-z-]+)/', include([
        url(r'^waveform/', views.ItemWaveView.as_view()),
        # Get transcoded audio
        # Ex: /api/item/--<uuid>--/download/ogg
        url(r'^download/(?P<extension>' + EXPORT_EXT + ')$',
            views.ItemTranscode.as_view(), name="item-transcode"),
    ]),
    ),
    # ----- Timeside ------
    url(r'^$', views.ItemList.as_view(), name="timeside-item-list"),
    # Items
    # ex: /item/5/
    url(r'^items/(?P<uuid>[0-9a-z-]+)/', include([
        url(r'^$', views.ItemDetail.as_view(), name="timeside-item-detail"),
        url(r'^export/$', views.ItemDetailExport.as_view(),
            name='timeside-item-export'),
        url(r'^download/(?P<extension>' + EXPORT_EXT + ')$',
            views.ItemTranscode.as_view(), name="item-transcode"),
    ])
    ),
    # Results
    url(r'^api/results/(?P<uuid>[0-9a-z-]+)/visual/',
        views.ResultVisualizationViewSet.as_view(), name="timeside-result-visualization"),
    url(r'^results/(?P<pk>.*)/json/$',
        views.ResultAnalyzerView.as_view(), name="timeside-result-json"),
    url(r'^results/(?P<pk>.*)/png/$',
        views.ResultGrapherView.as_view(), name="timeside-result-png"),
    url(r'^results/(?P<pk>.*)/audio/$',
        views.ResultEncoderView.as_view(), name="timeside-result-audio"),
    url(r'^results/(?P<pk>.*)/(?P<res_id>.*)/elan/$',
        views.ResultAnalyzerToElanView.as_view(), name="timeside-result-elan"),
    url(r'^results/(?P<pk>.*)/(?P<res_id>.*)/sonic/$',
        views.ResultAnalyzerToSVView.as_view(), name="timeside-result-sonic"),
    # Player
    url(r'^player/$', views.PlayerView.as_view(), name="timeside-player"),
]


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ]
