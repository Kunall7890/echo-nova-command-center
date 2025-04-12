
import React from "react";
import { Note, Reminder } from "@/types/commands";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, FileText } from "lucide-react";

interface CommandDisplayProps {
  type: string;
  data?: any;
}

const CommandDisplay: React.FC<CommandDisplayProps> = ({ type, data }) => {
  if (!data) return null;

  switch (type) {
    case "reminder":
      return (
        <Card className="mt-4 border-nova-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5 text-nova-primary" />
              Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.reminders?.length > 0 ? (
              <ul className="space-y-2">
                {data.reminders.map((reminder: Reminder) => (
                  <li key={reminder.id} className="flex items-start">
                    {reminder.completed ? (
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="mr-2 h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div>
                      <p className={reminder.completed ? "line-through text-gray-500" : ""}>
                        {reminder.text}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(reminder.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No reminders yet.</p>
            )}
          </CardContent>
        </Card>
      );

    case "note":
      return (
        <Card className="mt-4 border-nova-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5 text-nova-primary" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.notes?.length > 0 ? (
              <ul className="space-y-2">
                {data.notes.map((note: Note) => (
                  <li key={note.id} className="flex items-start">
                    <div>
                      <p>{note.text}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(note.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No notes yet.</p>
            )}
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
};

export default CommandDisplay;
