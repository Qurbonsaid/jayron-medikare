import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const Medicine = () => {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Дори Бериш Жадвали (MAR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <p className="font-semibold">Бемор: Каримова Малика Шавкатовна</p>
              <p className="text-sm text-muted-foreground">Ётоқ: 103</p>
            </div>

            {/* Desktop view → table */}
            <div className="hidden md:block">
              <table className="w-full border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left">Дори Номи</th>
                    <th className="p-3 text-left">Дозаси</th>
                    <th className="p-3 text-center">08:00</th>
                    <th className="p-3 text-center">12:00</th>
                    <th className="p-3 text-center">16:00</th>
                    <th className="p-3 text-center">20:00</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-accent/50">
                    <td className="p-3">Амоксициллин</td>
                    <td className="p-3">500мг</td>
                    <td className="p-3 text-center">
                      <Badge className="bg-green-500">✓</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className="bg-green-500">✓</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary">-</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary">-</Badge>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-accent/50">
                    <td className="p-3">Парацетамол</td>
                    <td className="p-3">500мг</td>
                    <td className="p-3 text-center">
                      <Badge className="bg-green-500">✓</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary">-</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className="bg-green-500">✓</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary">-</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile view → cards */}
            <div className="grid gap-4 md:hidden">
              {[
                {
                  name: "Амоксициллин",
                  dose: "500мг",
                  times: {
                    "08:00": "✓",
                    "12:00": "✓",
                    "16:00": "-",
                    "20:00": "-",
                  },
                },
                {
                  name: "Парацетамол",
                  dose: "500мг",
                  times: {
                    "08:00": "✓",
                    "12:00": "-",
                    "16:00": "✓",
                    "20:00": "-",
                  },
                },
              ].map((med, idx) => (
                <Card key={idx} className="p-4">
                  <h3 className="font-semibold">{med.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Доза: {med.dose}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {Object.entries(med.times).map(([time, val]) => (
                      <div
                        key={time}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <span className="text-xs">{time}</span>
                        {val === "✓" ? (
                          <Badge className="bg-green-500">✓</Badge>
                        ) : (
                          <Badge variant="secondary">-</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Дори Қўшиш
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Medicine;
