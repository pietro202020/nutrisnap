from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field
from datetime import datetime
from sqlalchemy import Column, JSON 

class Meal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True) #unique id
    #maybe keep info if it is breakfast/lunch/other
    meal_type: str                    # 'breakfast' | 'lunch' | ...
    thumb_uri: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True) #date
    data: Dict[str, Any] = Field(sa_column=Column(JSON))  # nutrition data

