import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from haematology_loader import get_haem_dataloaders
from model import get_haem_model


def get_device() -> torch.device:
    if torch.cuda.is_available():
        return torch.device("cuda")
    if torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")


def train_model(data_dir: str, epochs: int, batch_size: int, lr: float, checkpoint_out: str) -> None:
    device = get_device()
    print(f"Using device: {device.type.upper()}")

    train_loader, val_loader, classes = get_haem_dataloaders(data_dir=data_dir, batch_size=batch_size)
    print(f"Loaded {len(classes)} classes: {classes}")

    model = get_haem_model(num_classes=len(classes), pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=3)

    best_val_loss = float("inf")

    for epoch in range(epochs):
        model.train()
        running_train_loss = 0.0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_train_loss += loss.item()

        avg_train_loss = running_train_loss / len(train_loader)

        model.eval()
        running_val_loss = 0.0
        correct = 0
        total = 0

        with torch.no_grad():
            for val_images, val_labels in val_loader:
                val_images, val_labels = val_images.to(device), val_labels.to(device)
                val_outputs = model(val_images)
                v_loss = criterion(val_outputs, val_labels)
                running_val_loss += v_loss.item()

                _, predicted = torch.max(val_outputs, 1)
                total += val_labels.size(0)
                correct += (predicted == val_labels).sum().item()

        avg_val_loss = running_val_loss / len(val_loader)
        val_acc = 100.0 * correct / max(1, total)
        scheduler.step(avg_val_loss)

        print(
            f"Epoch [{epoch + 1:03d}/{epochs:03d}] "
            f"Train Loss: {avg_train_loss:.4f} | Val Loss: {avg_val_loss:.4f} | Val Acc: {val_acc:.2f}%"
        )

        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            torch.save(model.state_dict(), checkpoint_out)
            print(f"  -> Saved checkpoint to {checkpoint_out} (val_loss={best_val_loss:.4f})")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train HaemHelper ResNet-18 Classifier")
    parser.add_argument("--data-dir", type=str, default="./data/haematology")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--out", type=str, default="haematology_production.pth")
    args = parser.parse_args()

    train_model(args.data_dir, args.epochs, args.batch_size, args.lr, args.out)