#!/bin/bash

# A script to help migrate to react-router-dom

# 1. DashboardView
sed -i 's/onNavigate: (route: string) => void;//g' src/views/DashboardView.tsx
sed -i 's/onNavigate,//g' src/views/DashboardView.tsx
sed -i 's/onNavigate(\x27daily\x27)/navigate(\x27\/app\/daily\x27)/g' src/views/DashboardView.tsx
sed -i 's/onNavigate(\x27projects\x27)/navigate(\x27\/app\/projects\x27)/g' src/views/DashboardView.tsx
sed -i 's/onNavigate(\x27consistency\x27)/navigate(\x27\/app\/consistency\x27)/g' src/views/DashboardView.tsx
sed -i 's/onNavigate(\x27streaks\x27)/navigate(\x27\/app\/streaks\x27)/g' src/views/DashboardView.tsx
sed -i 's/onNavigate(`project-${proj.id}`)/navigate(`\/app\/projects\/${proj.id}`)/g' src/views/DashboardView.tsx

# 2. ProjectsView
sed -i 's/onNavigate: (route: string) => void;//g' src/views/ProjectsView.tsx
sed -i 's/onNavigate,//g' src/views/ProjectsView.tsx
sed -i 's/onNavigate(`project-${project.id}`)/navigate(`\/app\/projects\/${project.id}`)/g' src/views/ProjectsView.tsx

# 3. ProfileView
sed -i 's/onNavigate: (route: string) => void;//g' src/views/ProfileView.tsx
sed -i 's/({ onNavigate })/()/g' src/views/ProfileView.tsx
sed -i 's/onNavigate(\x27landing\x27)/navigate(\x27\/\x27)/g' src/views/ProfileView.tsx

