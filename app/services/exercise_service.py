from app.repositories.exercise import ExerciseRepository
from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate


class ExerciseService:
    def __init__(self, repo: ExerciseRepository):
        self.repo = repo

    def get_all(self):
        return self.repo.get_all()

    def get_by_id(self, exercise_id: int):
        exercise = self.repo.get_by_id(exercise_id)
        if not exercise:
            raise ValueError(f"Exercise {exercise_id} not found")
        return exercise

    def create(self, data: ExerciseCreate) -> Exercise:
        exercise = Exercise(
            name=data.name,
            muscle_group=data.muscle_group,
            description=data.description,
            difficulty=data.difficulty,
        )
        return self.repo.create(exercise)

    def search(self, query: str = None, muscle_group: str = None):
        if query:
            return self.repo.search(query)
        if muscle_group:
            return self.repo.get_by_muscle_group(muscle_group)
        return self.repo.get_all()
