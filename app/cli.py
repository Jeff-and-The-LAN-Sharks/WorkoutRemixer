from app.database import get_cli_session
from app.repositories.user import UserRepository
from app.services.auth_service import AuthService
from app.models.exercise import Exercise
from sqlmodel import select

EXERCISES = [
    # This will be the execies we put for the arms
    {"name": "Bicep Curl", "muscle_group": "Arms", "difficulty": "beginner",
     "video_id": "ykJmrZ5v0Oo",
     "description": "Stand with dumbbells at your sides, palms facing forward. Curl the weights up to your shoulders keeping elbows pinned to your sides. Squeeze at the top then lower slowly."},
    {"name": "Hammer Curl", "muscle_group": "Arms", "difficulty": "beginner",
     "video_id": "zC3nLlEvin4",
     "description": "Hold dumbbells with a neutral grip (thumbs up). Curl both weights simultaneously without rotating your wrists. Targets the brachialis for thicker arms."},
    {"name": "Tricep Dip", "muscle_group": "Arms", "difficulty": "beginner",
     "video_id": "0326dy_-CzM",
     "description": "Place hands on a bench behind you, fingers forward. Lower your body by bending elbows to 90 degrees then push back up to full extension. Keep your back close to the bench."},
    {"name": "Tricep Pushdown", "muscle_group": "Arms", "difficulty": "beginner",
     "video_id": "2-LAMcpzODU",
     "description": "Using a cable machine with a rope or bar attachment at chest height. Keep elbows pinned to your sides and push the weight down until arms are fully extended. Control the return."},
    {"name": "Concentration Curl", "muscle_group": "Arms", "difficulty": "beginner",
     "video_id": "Jvj2wV0vOYU",
     "description": "Sit on a bench, rest your elbow on your inner thigh. Curl the dumbbell up toward your shoulder focusing on the peak contraction. Best isolation exercise for the bicep."},
    {"name": "Skull Crusher", "muscle_group": "Arms", "difficulty": "intermediate",
     "video_id": "d_KZxkY_0cM",
     "description": "Lie on a bench holding a barbell or dumbbells above your chest. Bend only at the elbows to lower the weight toward your forehead then extend back up. Keep upper arms still."},
    {"name": "Preacher Curl", "muscle_group": "Arms", "difficulty": "beginner",
    "video_id": "fIWP-FRFNU0",
    "description": "Sit at a preacher bench with your arms resting on the pad. Curl the barbell or dumbbells up to your chin, squeeze at the top then lower slowly. Eliminates cheating for pure bicep isolation."},
    {"name": "Cable Curl", "muscle_group": "Arms", "difficulty": "beginner",
    "video_id": "NFzTWp2qpiE",
    "description": "Stand at a low cable pulley with a straight bar attachment. Curl the bar up keeping elbows pinned to your sides. Constant tension from the cable makes this great for peak contraction."},
    {"name": "Overhead Tricep Extension", "muscle_group": "Arms", "difficulty": "beginner",
    "video_id": "YbX7Wd8jQ-Q",
    "description": "Hold a dumbbell overhead with both hands. Lower it behind your head by bending at the elbows then press back up. Keeps the long head of the tricep fully stretched."},
    {"name": "Diamond Push Up", "muscle_group": "Arms", "difficulty": "intermediate",
    "video_id": "kGhDnFwMY3E",
    "description": "Place hands together under your chest forming a diamond shape. Lower your chest to your hands keeping elbows close to your body then push back up. Heavy tricep emphasis."},
     

    # this will be for the chest
    {"name": "Push Up", "muscle_group": "Chest", "difficulty": "beginner",
     "video_id": "IODxDxX7oi4",
     "description": "Start in a high plank with hands shoulder-width apart. Lower your chest to the ground keeping your body in a straight line, elbows at 45 degrees. Push explosively back up."},
    {"name": "Bench Press", "muscle_group": "Chest", "difficulty": "intermediate",
     "video_id": "rT7DgCr-3pg",
     "description": "Lie on a flat bench, grip the bar slightly wider than shoulder-width. Unrack and lower to your mid-chest with control, then press back up powerfully. Keep feet flat on the floor."},
    {"name": "Incline Press", "muscle_group": "Chest", "difficulty": "intermediate",
     "video_id": "DbFgADa2PL8",
     "description": "Set the bench to 30-45 degrees. Press dumbbells or a barbell from upper chest level. This variation targets the upper pecs for a fuller chest appearance."},
    {"name": "Chest Fly", "muscle_group": "Chest", "difficulty": "beginner",
     "video_id": "QENKPHhQVi4",
     "description": "Lie on a flat bench holding dumbbells above your chest with a slight bend in your elbows. Open your arms wide in an arc lowering to chest level, then squeeze back together."},
    {"name": "Cable Crossover", "muscle_group": "Chest", "difficulty": "intermediate",
     "video_id": "taI4XduLpTk",
     "description": "Stand between two high cable pulleys. Pull the handles down and across your body in a hugging motion, squeezing your chest at the bottom. Great for inner chest definition."},
    {"name": "Decline Push Up", "muscle_group": "Chest", "difficulty": "beginner",
    "video_id": "SKPab2YC8BE",
    "description": "Place feet on an elevated surface and hands on the floor. Lower your chest toward the floor then push back up. The decline angle shifts emphasis to the upper chest."},
    {"name": "Dumbbell Pullover", "muscle_group": "Chest", "difficulty": "intermediate",
    "video_id": "FK4rHfWKEac",
    "description": "Lie across a bench holding one dumbbell above your chest. Lower it in an arc behind your head feeling a chest and lat stretch then pull it back over your chest."},
    {"name": "Pec Deck", "muscle_group": "Chest", "difficulty": "beginner",
    "video_id": "Z57CtFmRMxA",
    "description": "Sit at the pec deck machine with arms on the pads at chest height. Bring the pads together squeezing your chest hard at the centre then open back with control."},
    
    # the back
    {"name": "Deadlift", "muscle_group": "Back", "difficulty": "intermediate",
     "video_id": "op9kVnSso6Q",
     "description": "Stand with feet hip-width, bar over mid-foot. Hinge at hips, grip the bar, keep back flat. Drive through your heels pushing the floor away, extending hips and knees simultaneously."},
    {"name": "Romanian Deadlift", "muscle_group": "Back", "difficulty": "intermediate",
     "video_id": "JCXUYuzwNrM",
     "description": "Hold the bar at hip level, soft bend in knees. Push your hips back as you lower the bar down your legs feeling a deep hamstring stretch. Drive hips forward to return."},
    {"name": "Pull Up", "muscle_group": "Back", "difficulty": "intermediate",
     "video_id": "eGo4IYlbE5g",
     "description": "Hang from a bar with an overhand grip slightly wider than shoulders. Pull your chest to the bar leading with your elbows. Lower with full control. Avoid swinging."},
    {"name": "Bent Over Row", "muscle_group": "Back", "difficulty": "intermediate",
     "video_id": "FWJR5Ve8bnQ",
     "description": "Hinge forward at 45 degrees holding a barbell. Pull the bar to your lower ribcage squeezing your shoulder blades together at the top. Lower with control."},
    {"name": "Lat Pulldown", "muscle_group": "Back", "difficulty": "beginner",
     "video_id": "CAwf7n6Luuc",
     "description": "Sit at a cable machine, grip the bar wider than shoulders. Pull the bar to your upper chest leading with your elbows, arching slightly back. Feel your lats stretch on the way up."},
    {"name": "Seated Cable Row", "muscle_group": "Back", "difficulty": "beginner",
     "video_id": "GZbfZ033f74",
     "description": "Sit upright at a low cable machine. Pull the handle to your lower abdomen squeezing your elbows back. Avoid rounding your spine. Feel the full stretch at the start."},
    {"name": "Single Arm Dumbbell Row", "muscle_group": "Back", "difficulty": "beginner",
    "video_id": "pYcpY20QaE8",
    "description": "Place one knee and hand on a bench for support. Pull a dumbbell from a dead hang position up to your hip squeezing your lat at the top. Keep your back flat throughout."},
    {"name": "T-Bar Row", "muscle_group": "Back", "difficulty": "intermediate",
    "video_id": "j3Igk5nyZE4",
    "description": "Straddle a landmine bar or T-bar machine. Hinge forward at 45 degrees and row the weight to your chest leading with your elbows. Great for overall back thickness."},
    {"name": "Hyperextension", "muscle_group": "Back", "difficulty": "beginner",
    "video_id": "ph3pddpKzzw",
    "description": "Lock your feet into a hyperextension bench and lower your torso toward the floor. Raise back up to parallel using your lower back and glutes. Avoid hyperextending at the top."},
    
    # the shoulders
    {"name": "Shoulder Press", "muscle_group": "Shoulders", "difficulty": "intermediate",
     "video_id": "qEwKCR5JCog",
     "description": "Hold dumbbells at shoulder height, elbows at 90 degrees. Press directly overhead until arms are fully extended. Lower back to start with control. Keep core braced."},
    {"name": "Lateral Raise", "muscle_group": "Shoulders", "difficulty": "beginner",
     "video_id": "3VcKaXpzqRo",
     "description": "Hold light dumbbells at your sides. Raise arms out laterally until parallel with the floor, slight bend in elbows. Lower slowly resisting gravity. Avoid shrugging."},
    {"name": "Front Raise", "muscle_group": "Shoulders", "difficulty": "beginner",
     "video_id": "hRJ6tR5-if0",
     "description": "Hold dumbbells in front of your thighs. Raise one or both arms forward to shoulder height keeping a slight bend in the elbows. Lower with control."},
    {"name": "Arnold Press", "muscle_group": "Shoulders", "difficulty": "intermediate",
     "video_id": "6Z15_WdXmVw",
     "description": "Start with dumbbells at chin height palms facing you. Rotate your wrists outward as you press overhead. Reverse the movement on the way down for full shoulder development."},
    {"name": "Face Pull", "muscle_group": "Shoulders", "difficulty": "beginner",
     "video_id": "rep-qVOkqgk",
     "description": "Set a cable rope at face height. Pull the rope toward your face with elbows flared high. Great for rear delt development and shoulder health."},
    {"name": "Upright Row", "muscle_group": "Shoulders", "difficulty": "intermediate",
    "video_id": "Ub6QruNKfbY",
    "description": "Hold a barbell or dumbbells in front of your thighs. Pull the weight straight up toward your chin leading with your elbows flaring out. Stop when elbows reach shoulder height."},
    {"name": "Rear Delt Fly", "muscle_group": "Shoulders", "difficulty": "beginner",
    "video_id": "EA7u4Q_8HQ0",
    "description": "Hinge forward at 90 degrees holding light dumbbells. Raise both arms out to the sides squeezing your rear delts and shoulder blades together. Lower with control."},
    {"name": "Cable Lateral Raise", "muscle_group": "Shoulders", "difficulty": "beginner",
    "video_id": "Z5FA9aq3L6A",
    "description": "Stand sideways to a low cable pulley. Pull the handle out and up to shoulder height with a slight bend in the elbow. Cable keeps constant tension throughout the movement."},
    
    # the legs
    {"name": "Squat", "muscle_group": "Legs", "difficulty": "beginner",
     "video_id": "aclHkVaku9U",
     "description": "Stand feet shoulder-width apart, toes slightly out. Sit back and down keeping chest up and knees tracking over toes. Reach parallel or below, then drive through your heels to stand."},
    {"name": "Lunge", "muscle_group": "Legs", "difficulty": "beginner",
     "video_id": "QOVaHwm-Q6U",
     "description": "Step forward with one leg and lower your hips until both knees are at 90 degrees. Keep your torso upright and front knee above your ankle. Push off to return."},
    {"name": "Romanian Deadlift", "muscle_group": "Legs", "difficulty": "intermediate",
     "video_id": "JCXUYuzwNrM",
     "description": "Hold weights at hip level with a soft knee bend. Hinge at the hips pushing them back while lowering the weights down your legs. Feel the hamstring stretch then drive hips forward."},
    {"name": "Leg Press", "muscle_group": "Legs", "difficulty": "beginner",
     "video_id": "IZxyjW7MPJQ",
     "description": "Sit in the leg press machine with feet shoulder-width on the platform. Lower the platform until knees reach 90 degrees then press back up without locking your knees."},
    {"name": "Calf Raise", "muscle_group": "Legs", "difficulty": "beginner",
     "video_id": "gwLzBJYoWlI",
     "description": "Stand on a raised surface with heels hanging off. Rise onto the balls of your feet as high as possible, hold briefly at the top, then lower below the platform for a full stretch."},
    {"name": "Leg Curl", "muscle_group": "Legs", "difficulty": "beginner",
     "video_id": "ELOCsoDSmrg",
     "description": "Lie face down on the leg curl machine. Curl your heels toward your glutes squeezing your hamstrings at the top. Lower slowly for maximum time under tension."},
    {"name": "Bulgarian Split Squat", "muscle_group": "Legs", "difficulty": "intermediate",
     "video_id": "2C-uNgKwPLE",
     "description": "Place your rear foot on a bench, front foot forward. Lower your rear knee toward the floor keeping your torso upright. Drive through the front heel to stand."},
    {"name": "Hack Squat", "muscle_group": "Legs", "difficulty": "intermediate",
    "video_id": "0tn5K9NlCfo",
    "description": "Position yourself in the hack squat machine with feet shoulder-width on the platform. Lower until thighs are parallel then drive back up. Targets quads with less lower back stress."},
    {"name": "Sumo Squat", "muscle_group": "Legs", "difficulty": "beginner",
    "video_id": "6L7KFAN5MCE",
    "description": "Stand with a wide stance and toes pointed out. Lower your hips straight down keeping your chest up and knees tracking over toes. Emphasises inner thighs and glutes."},
    {"name": "Step Up", "muscle_group": "Legs", "difficulty": "beginner",
    "video_id": "dQqApCGd5Ss",
    "description": "Stand in front of a box or bench. Step up with one foot driving through the heel to bring your body up. Step back down and repeat. Great for single leg strength and balance."},
    {"name": "Hip Thrust", "muscle_group": "Legs", "difficulty": "beginner",
    "video_id": "xDmFkJxPzeM",
    "description": "Rest your upper back on a bench with a barbell across your hips. Drive your hips up by squeezing your glutes until your body forms a straight line. Lower and repeat."},
    
    # the core
    {"name": "Plank", "muscle_group": "Core", "difficulty": "beginner",
     "video_id": "ASdvN_XEl_c",
     "description": "Hold a forearm plank with your body in a straight line from head to heels. Squeeze your glutes and abs, breathe normally. Don't let your hips sag or rise."},
    {"name": "Crunch", "muscle_group": "Core", "difficulty": "beginner",
     "video_id": "Xyd_fa5zoEU",
     "description": "Lie on your back, knees bent, hands behind head. Curl your upper body toward your knees using your abs. Avoid pulling on your neck. Lower with control."},
    {"name": "Russian Twist", "muscle_group": "Core", "difficulty": "beginner",
     "video_id": "JyUqwkVpsi8",
     "description": "Sit with knees bent and lean back slightly. Hold a weight and rotate your torso from side to side tapping the weight to the floor on each side."},
    {"name": "Leg Raise", "muscle_group": "Core", "difficulty": "intermediate",
     "video_id": "JB2oyawG9KI",
     "description": "Lie flat on your back, legs straight. Raise your legs to 90 degrees keeping them straight, then lower slowly without touching the floor. Keep your lower back pressed down."},
    {"name": "Mountain Climber", "muscle_group": "Core", "difficulty": "beginner",
     "video_id": "nmwgirgXLYM",
     "description": "Start in a high plank position. Drive your knees toward your chest alternately in a running motion as fast as possible while maintaining a flat back."},
    {"name": "Ab Wheel Rollout", "muscle_group": "Core", "difficulty": "advanced",
     "video_id": "9ZCoAbI7uX0",
     "description": "Kneel with an ab wheel in front of you. Roll forward slowly extending your body toward the floor as far as you can, then contract your abs to pull back to the start."},
    {"name": "Dead Bug", "muscle_group": "Core", "difficulty": "beginner",
    "video_id": "g_BYB0R-4Ws",
    "description": "Lie on your back with arms pointing to the ceiling and knees at 90 degrees. Slowly lower opposite arm and leg toward the floor while keeping your lower back pressed down. Return and repeat."},
    {"name": "Hanging Knee Raise", "muscle_group": "Core", "difficulty": "intermediate",
    "video_id": "KNzJ3GuIpB8",
    "description": "Hang from a pull up bar with an overhand grip. Bring your knees up toward your chest contracting your abs at the top. Lower slowly without swinging."},
    {"name": "Cable Crunch", "muscle_group": "Core", "difficulty": "beginner",
    "video_id": "2fbujeH3F0E",
    "description": "Kneel at a high cable pulley holding a rope attachment behind your head. Crunch your elbows toward your knees rounding your spine. Focus on the abs doing the work not your hips."},

    # for the ful body
    {"name": "Burpee", "muscle_group": "Full Body", "difficulty": "intermediate",
     "video_id": "dZgVxmf6jkA",
     "description": "From standing, drop your hands to the floor, jump your feet back to a plank, do a push up, jump feet to hands, then explosively jump up with arms overhead."},
    {"name": "Kettlebell Swing", "muscle_group": "Full Body", "difficulty": "intermediate",
     "video_id": "YSxHifyI6s8",
     "description": "Stand over a kettlebell feet shoulder-width. Hinge at hips to grab it, hike it back between your legs then drive your hips explosively forward to swing it to chest height."},
    {"name": "Box Jump", "muscle_group": "Full Body", "difficulty": "intermediate",
     "video_id": "52r_Ul5k03g",
     "description": "Stand in front of a box. Dip into a quarter squat, swing your arms and jump explosively landing softly on top of the box. Step down carefully between reps."},
    {"name": "Battle Ropes", "muscle_group": "Full Body", "difficulty": "beginner",
     "video_id": "pQb2xIGioyQ",
     "description": "Hold one end of each rope, stand in a slight squat. Create alternating waves by slamming the ropes up and down as fast as possible. Great cardio and upper body builder."},
    {"name": "Thruster", "muscle_group": "Full Body", "difficulty": "intermediate",
    "video_id": "sLIswEpOHng",
     "description": "Hold dumbbells or a barbell at shoulder height. Squat down then explosively stand up using the momentum to press the weight overhead in one fluid movement."},
    {"name": "Clean and Press", "muscle_group": "Full Body", "difficulty": "advanced",
    "video_id": "KCe8l86-alA",
    "description": "Pull a barbell from the floor explosively rotating your elbows under the bar to catch it at shoulder height. Then press it overhead. A complete power movement."},
    {"name": "Jump Squat", "muscle_group": "Full Body", "difficulty": "beginner",
    "video_id": "XOTO2qWRy9U",
    "description": "Perform a regular squat then explode upward jumping as high as possible. Land softly bending your knees to absorb the impact and immediately go into the next rep."},
    {"name": "Farmer Carry", "muscle_group": "Full Body", "difficulty": "beginner",
    "video_id": "rt17lmnaLSM",
    "description": "Hold heavy dumbbells or kettlebells at your sides. Walk forward with controlled steps keeping your shoulders back and core braced. Great for grip strength and overall conditioning."},
]


def seed():
    with get_cli_session() as db:
        # this is to seed bob so when logging in we can use him as a user
        repo = UserRepository(db)
        auth = AuthService(repo)
        if not repo.get_by_username("bob"):
            auth.register_user("bob", "bob@workoutremixer.com", "bobpass")
            print("✅ User bob seeded")
        else:
            print("ℹ️  bob already exists")

        # this is to seed the exercises for the website so they can show up
        for ex_data in EXERCISES:
            existing = db.exec(select(Exercise).where(Exercise.name == ex_data["name"])).first()
            if not existing:
                exercise = Exercise(**ex_data)
                db.add(exercise)
        db.commit()
        print("✅ Exercises seeded")


#we need on for full body too can someone add it after Aaron commits?

#done