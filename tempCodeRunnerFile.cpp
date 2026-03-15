#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Item {
    int weight;
    int profit;
    double ratio;
};

// Compare function to sort by ratio descending
bool cmp(Item a, Item b) {
    return a.ratio > b.ratio;
}

int main() {
    int n;
    cout << "Enter number of items: ";
    cin >> n;

    vector<Item> items(n);
    for (int i = 0; i < n; i++) {
        cout << "Enter weight of item " << i+1 << ": ";
        cin >> items[i].weight;
        cout << "Enter profit of item " << i+1 << ": ";
        cin >> items[i].profit;
        items[i].ratio = (double)items[i].profit / items[i].weight;
    }

    int capacity;
    cout << "Enter knapsack capacity: ";
    cin >> capacity;

    // Sort items by ratio
    sort(items.begin(), items.end(), cmp);

    double totalProfit = 0.0;
    vector<double> taken(n, 0); // Fraction of each item taken

    for (int i = 0; i < n; i++) {
        if (items[i].weight <= capacity) {
            taken[i] = 1; // Take full item
            totalProfit += items[i].profit;
            capacity -= items[i].weight;
        } else {
            taken[i] = (double)capacity / items[i].weight; // Take fraction
            totalProfit += items[i].profit * taken[i];
            capacity = 0;
            break;
        }
    }

    cout << "\nItems taken:\n";
    for (int i = 0; i < n; i++) {
        if (taken[i] > 0)
            cout << "Item " << i+1 << ": " << taken[i]*100 << "%\n";
    }

    cout << "Maximum Profit = " << totalProfit << endl;

    return 0;
}