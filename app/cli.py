from app.database import get_cli_session
from app.repositories.user import UserRepository
from app.services.auth_service import AuthService
from app.models.exercise import Exercise
from sqlmodel import select

EXERCISES = [
    {"name": "Bicep Curl", "muscle_group": "Arms", "difficulty": "beginner",
     "description": "Stand with dumbbells at your sides. Curl weights up to shoulders keeping elbows close to body. Lower slowly."},
    {"name": "Hammer Curl", "muscle_group": "Arms", "difficulty": "beginner",
     "description": "Like a bicep curl but with a neutral (thumbs-up) grip. Targets the brachialis muscle."},
    {"name": "Tricep Dip", "muscle_group": "Arms", "difficulty": "beginner",
     "description": "With hands on a bench behind you, lower body by bending elbows then push back up to full extension."},
    {"name": "Squat", "muscle_group": "Legs", "difficulty": "beginner",
     "description": "Feet shoulder-width apart. Lower until thighs are parallel to ground. Keep chest up and knees over toes."},
    {"name": "Lunge", "muscle_group": "Legs", "difficulty": "beginner",
     "description": "Step forward with one leg, lower hips until both knees are at 90 degrees. Keep front knee above ankle."},
    {"name": "Calf Raise", "muscle_group": "Legs", "difficulty": "beginner",
     "description": "Stand with feet hip-width apart. Rise onto balls of feet as high as possible, then lower slowly."},
    {"name": "Push Up", "muscle_group": "Chest", "difficulty": "beginner",
     "description": "Start in plank. Lower chest to ground by bending elbows at 45 degrees, then push back to full extension."},
    {"name": "Shoulder Press", "muscle_group": "Shoulders", "difficulty": "intermediate",
     "description": "Hold weights at shoulder height with elbows at 90 degrees. Press overhead until arms are fully extended."},
    {"name": "Lateral Raise", "muscle_group": "Shoulders", "difficulty": "beginner",
     "description": "Hold weights at sides. Raise arms out laterally until parallel with floor. Control the descent."},
    {"name": "Deadlift", "muscle_group": "Back", "difficulty": "intermediate",
     "description": "Hinge at hips with soft knees. Lift weight keeping back straight, driving hips forward at the top."},
    {"name": "Romanian Deadlift", "muscle_group": "Back", "difficulty": "intermediate",
     "description": "Keep legs nearly straight, hinge at hips lowering weights down legs while feeling hamstring stretch."},
    {"name": "Plank", "muscle_group": "Core", "difficulty": "beginner",
     "description": "Hold a forearm plank position with body in a straight line from head to heels. Engage your core throughout."},
]


def seed():
    with get_cli_session() as db:
        repo = UserRepository(db)
        auth = AuthService(repo)
        if not repo.get_by_username("bob"):
            auth.register_user("bob", "bob@workoutremixer.com", "bobpass")
            print("✅ User bob seeded")
        else:
            print("ℹ️  bob already exists")

        existing = db.exec(select(Exercise)).first()
        if not existing:
            for ex_data in EXERCISES:
                exercise = Exercise(**ex_data)
                db.add(exercise)
            db.commit()
            print(f"✅ {len(EXERCISES)} exercises seeded")
        else:
            print("ℹ️  Exercises already seeded")
